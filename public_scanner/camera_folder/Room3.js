

    // import { timeInterval } from "../javascript/index.js"; 

    const emailreport = (from, email, subject,room) => {
    var content = `Good Day QCUians! Were really sorry for the inconvenience that the system caused. 
      This message is to notify that the room ${room}  is having trouble with the camera. 
      We assure you to take our full responsibility for this concern, the hardworking teams will provide immediate solution to this problem. 
      We Thank you for your dedication and consideration, We appreciate you and all a lot. **THIS IS SYSTEM GENERATED PLEASE DO NOT REPLY**`;
    
      fetch("https://automatedemailservice.onrender.com/sendEmail",{
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: from,
          email: email,
          subject: subject,
          content: content
        })
      }).then((res) => {
        res.json()
        console.log(res)
      }).then((data) => {
        // console.log(data)
      }).catch((err) => {
        console.log(err)
      })
    }
    
    const timeFormat = {
      date: () => {
        const date = new Date();
        return date;
      },
      currentDay: new Intl.DateTimeFormat("en-ph", {
        dateStyle: "medium",
        timeZone: "Asia/Manila",
      }),
      currentTime: new Intl.DateTimeFormat("en-ph", {
        timeStyle: "short",
        timeZone: "Asia/Manila",
      }),
    };
    
    function scanner_generate_image() {
      let time_created = timeFormat.currentTime.format(timeFormat.date());
      let date_created = timeFormat.currentDay.format(timeFormat.date());
    
      var canvas = document.createElement("canvas");
      let data_time = `${date_created}  :  ${time_created}`;
    
      const video = document.querySelector("#scanner_camera");     
    
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(data_time, 20, 40);
      var dataUrl_1 = canvas.toDataURL();
    
      return dataUrl_1
    
    }
    
    function scan_capture(facultyId){
      const image = scanner_generate_image();

      $.ajax({
        url: "../scanner_capture.php",
        type: "POST",
        data: {image:image, faculty: facultyId}
      });
    }



  
  const _scanner = async () =>{
    let video = document.querySelector("#scanner_camera")
    const scanner = new Instascan.Scanner({
        video: video,
        scanPeriod: 5,
        mirror: false,
      });
      
      scanner.addListener("scan", (content) => {
        let index = 0;
        if(index === 0){
          index++
          document.getElementById("faculty").value = content.toString();
          document.getElementById("subbtn").click();
        }else{
          setTimeout(() => {
            scan_capture($("#facultyId").val())
          }, 5000); //5s before capture
        }

        console.log("Scanner for Room3",);
      });
      const webcam = await Instascan.Camera.getCameras();
    
      webcam.forEach(async (cam) => {
        console.log(cam.id);
        if (cam.id === "d25ea06c134d4a6ed81a86c03e2665d64959ca48b2cf1806814b2719177833aa") {
          if (webcam.length > 0) {
            await scanner.start(cam);
          } else {
            alert("No Camera Found");
          }
        }
      })
    }
    
    _scanner(); 
    $("#attendance").submit(function (e) {
      e.preventDefault();
      var attendance = $(this).serialize();
      let room_qr =  document.getElementById("faculty").value

      if(room_qr  === "0002"){
            $.ajax({
              type: "POST",
              url: "../attendance.php",
              data: attendance,
              dataType: "json",
              success: function (response) {
                console.log(response)
                if (response.error) {
                  $(".alert").hide();
                  $(".alert-danger").show();
                  $(".message").html(response.message);
                } else {
                  $(".alert").hide();
                  $(".alert-success").show();
                  $(".message").html(response.message);

                 

                  setTimeout(() => {
                    scan_capture($("#facultyId").val())
                    $("#faculty").val("");
                  
                    // function stopInterval() {
                    //   clearInterval(timeInterval);
                    // }

                  }, 5000); //5s before capture
                }
              
              },
              catch: (err) => {
                console.log(err.message);
              },
            });
          
      }else{
        console.log("Invalid QrL Please go to your designated room!")
      }
    });
 

    setInterval(()=>{
        const videoStream = document.querySelector("#scanner_camera")
        var mediaStream = videoStream.srcObject
        if(mediaStream){
          mediaStream.oninactive = function() {
            //Camera Unplugged - Email
            const html = `
            <div class="w-100 h-100 position-absolute " style="z-index:2;">
            <img src="../assets/no_cam.gif" alt="" class="w-100 h-100 position-absolute">
            </div>
            <div class="d-flex text-center text-dark fw-bold fs-2 position-absolute top-50 start-50 translate-middle" id="status" style="z-index:3;">The Camera was unplugged</div>`

            $("videoStream").attr("data-status","0")
            $(videoStream).parent().prepend(html)
              // function stopInterval() {
              //   clearInterval(timeInterval);
              // }
             //change emailreport 2nd parameter for email receiver
            emailreport("QCUMS", "beni.creatives@gmail.com", "Error Report!","Room3")
          };
        }
  },1000)
    
    