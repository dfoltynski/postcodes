$(document).ready(function () {
  console.log("asd");
  $(".form").submit(function (e) {
    e.preventDefault();
    const formDataArray = $(".form").serializeArray();

    // Check if user provided all data
    formDataArray.forEach((data) => {
      if (data.value === "") {
        setError(data.name);
      } else {
        setCorrect(data.name);
      }
    });

    if (
      $(".error").length === 0 &&
      $(".form__group--title--error").length === 0
    ) {
      const formDataObject = formDataArray.reduce((obj, item) => {
        obj[item.name] = item.value;
        return obj;
      }, {});

      if (isEmailValid(formDataObject.email)) {
        setCorrect("email");
      } else {
        setError("email");
      }

      if (isPhoneValid(formDataObject.phone.trim().split(" ").join(""))) {
        setCorrect("phone");

        // I don't know which option is better to keep (with prefix or without).
        $(".form__input[name=phone]").val(
          formDataObject.phone
            .trim()
            .split(" ")
            .join("")
            .replace(/\+\d{2}/, "")
        );
      } else {
        setError("phone");
      }
      validatePostcode(formDataObject.postcode.trim());
      handlePostcode(formDataObject.postcode.trim());
      $(".form")[0].reset();
      $(".form__input--submit").prop("disabled", true);
      alert("wysłano!");
    }
  });
  $("#postcode").change(() => {
    const postcode = formatPostcode(
      $("#postcode").val().trim().split(" ").join("")
    );
    console.log(validatePostcode(postcode));

    handlePostcode(postcode);
  });
});

const setError = (name) => {
  $(`#${name}`).addClass("error");
  $(`#${name}`).removeClass("correct");
  $(`label[for=${name}]`).addClass("form__group--title--error");
};

const setCorrect = (name) => {
  $(`#${name}`).removeClass("error");
  $(`#${name}`).addClass("correct");
  $(`label[for=${name}]`).removeClass("form__group--title--error");
};

const validatePostcode = (postcode) => {
  postcode = formatPostcode(postcode);
  console.log(postcode);
  const regex = /^\d{2}-\d{3}$/;

  return regex.test(postcode);
};

const handlePostcode = (postcode) => {
  if (validatePostcode(postcode)) {
    setCorrect("postcode");
    if (postcode.length === 6) {
      if (JSON.parse(localStorage.getItem(`${postcode}`)) !== null) {
        handleCityInfoAutocompletion(postcode);
      } else {
        (async () => {
          const options = {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ postcode: postcode }),
          };
          try {
            const res = await fetch(
              `http://localhost:8080/get-postcodes`,
              options
            );
            const postcodeDetails = await res.json();
            // This is really trivial form of caching api response
            localStorage.setItem(
              `${postcode}`,
              JSON.stringify(postcodeDetails)
            );
            handleCityInfoAutocompletion(postcode);
          } catch (error) {
            console.log(error);
          }
        })();

        // $.ajax({
        //   type: "get",
        //   url: `http://localhost:8080/get-postcodes`,
        //   contentType: "application/json",
        //   dataType: "json",
        //   crossDomain: true,
        //   data: { postcode: postcode },
        //   success: (response) => {
        //     console.log(response);
        //   },
        // });
      }
    }
  } else {
    setError("postcode");
  }
};

const handleCityInfoAutocompletion = (postcode) => {
  $("#city").find("option").remove();
  $("#street").find("option").remove();
  const citySet = new Set();
  const streetSet = new Set();
  JSON.parse(localStorage.getItem(`${postcode}`)).forEach((city) => {
    citySet.add(city.miejscowosc);
    streetSet.add(city.ulica);
  });

  console.log(citySet);
  citySet.forEach((city) => {
    $("#city").append(`<option value="${city}">${city}</option>`);
  });

  console.log(streetSet);
  streetSet.forEach((street) => {
    $("#street").append(`<option value="${street}">${street}</option>`);
  });
};

const formatPostcode = (postcode) => {
  postcode.indexOf("-") !== -1
    ? postcode
    : (postcode = `${postcode.slice(0, 2)}-${postcode.slice(2)}`);
  $(".form__input[name=postcode]").val(postcode);

  return postcode;
};

const isPhoneValid = (phone) => {
  let regex =
    /^(?:(?:(?:\+|00)?48)|(?:\(\+?48\)))?(?:1[2-8]|2[2-69]|3[2-49]|4[1-8]|5[0-9]|6[0-35-9]|[7-8][1-9]|9[145])\d{7}$/;
  return regex.test(phone);
};

const isEmailValid = (email) => {
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
};
