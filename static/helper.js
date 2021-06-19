function preview_image(event) {
  var reader = new FileReader();
  reader.onload = function () {
    var output = document.getElementById("output_image");
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function predict() {
  var file = document.querySelector("input[type=file]")["files"][0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var img = document.createElement("img");
    img.src = e.target.result;
    var canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 224, 224);
    dataurl = canvas.toDataURL(file.type);
    base64String = dataurl.replace("data:", "").replace(/^.+,/, "");
    fetch(`${window.origin}/output/`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(base64String),
      cache: "no-cache",
      headers: new Headers({
        "content-type": "application/json",
      }),
    })
      .then(function (response) {
        if (response.status !== 200) {
          console.log(
            `Looks like there was a problem. Status code: ${response.status}`
          );
          return;
        }
        response.json().then(function (data) {
          // console.log(data);
          if (data.cls === "Low Accuracy") {
            document.getElementById("cls").innerHTML = "Not detected";
            document.getElementById("acc").innerHTML = "0";
            swal("Please provide good IMAGE (Detected with Low Accuracy)");
          } else {
            document.getElementById("cls").innerHTML = data.cls;
            document.getElementById("acc").innerHTML = data.acc;
          }
        });
      })
      .catch(function (error) {
        console.log("Fetch error: " + error);
      });
  };
  reader.readAsDataURL(file);
}
