// const tooltipTriggerList = document.querySelectorAll(
//   '[data-bs-toggle="tooltip"]'
// );
// const tooltipList = [...tooltipTriggerList].map(
//   (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
// );

const APIController = (function () {
  const _storeCamera_info = (async () => {
    const results = await navigator.mediaDevices.enumerateDevices();
    const devices_arr = [];
    // const available_camera = [];

    results.forEach((result) => {
      if (result.kind === "videoinput") {
        devices_arr.push(result);
      }
    });
    console.log(devices_arr);
    return devices_arr;
  })();
  const _pairing_device = async (deviceInfo, Rooms) => {
    const available_camera = [];
    deviceInfo.forEach((info, index) => {
      info.device = Rooms[index].Device;
      info.status = Rooms[index].status;
      info.Room_name = Rooms[index].Room_name;
      // info.Device = Rooms[index].Device;
      const { Room_name, device, deviceId, label, status } = info;
      const devices = {
        Room_name: Room_name,
        device: device,
        deviceId: deviceId,
        label: label,
        status: status,
      };
      available_camera.push(devices);
    });
    return available_camera;
  };
  const _room_webcam = async (constraints, video) => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (error) {
        console.log(constraints);
        console.log(error);
      });
  };
  const _fetch_pairedDevice = async () => {
    try {
      const result = await fetch("./paired_devices.json?" + Date.now(), {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.log("Please refresh the Page");
    }
  };
  const _fetch_rooms = async () => {
    try {
      const result = await fetch("./rooms.json?" + Date.now(), {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.log("please Refresh the page");
    }
  };
  const _fetch_schedule = async () => {
    try {
      const result = await fetch("./prof_schedule.json?" + Date.now(), {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.log("please Refresh the page");
    }
  };

  const _storeInfo = async (data) => {
    $.ajax({
      method: "POST",
      url: "fetchRoomList.php",
      data: { paired_devices: 1, devices: data },
    });
  };

  const _getSchedule = async () => {
    $.ajax({
      method: "POST",
      url: "fetchRoomList.php",
      data: { prof_schedule: 1 },
    });
  };
  const _scanner = async (camera) => {
    let video = document.querySelector("#scanner_camera");

    const main_scanner = new Instascan.Scanner({
      video: video,
      scanPeriod: 5,
      mirror: false,
    });

    const webcam = await Instascan.Camera.getCameras();

    webcam.forEach(async (cam) => {
      // console.log(cam.id);
      if (cam.id === camera) {
        if (webcam.length > 0) {
          await main_scanner.start(cam);
        } else {
          alert("No Camera Found");
        }
      }
    });
    return main_scanner;
  };

  const _openOtherScanner = async (camera, index) => {
    let video = document.querySelector(`#scanner_camera_${index}`);

    const open_scanner = new Instascan.Scanner({
      video: video,
      scanPeriod: 5,
      mirror: false,
    });

    const webcam = await Instascan.Camera.getCameras();

    webcam.forEach(async (cam) => {
      // console.log(cam.id);
      if (cam.id === camera) {
        if (webcam.length > 0) {
          await open_scanner.start(cam);
        } else {
          alert("No Camera Found");
        }
      }
    });
    return open_scanner;
  };
  const _closeOtherScanner = async (deviceId) => {
    var constraints = {
      video: {
        deviceId: {
          exact: deviceId,
        },
      },
    };
   const stream = await navigator.mediaDevices.getUserMedia(constraints)
   const tracks = stream.getTracks();
   tracks.forEach((track)=>{
    track.stop();
    
   })
   console.log(`Camera ${deviceId} stopped!!`);
  };

  const _config_setting = async (device, label, deviceId) => {
    // const details = [];
    const info = {
      device: device,
      deviceId: deviceId,
      label: label,
    };
    // details.push(info);
    console.log("my new info", info);
    return info;
  };

  return {
    pairingDevice(deviceInfo, Rooms) {
      return _pairing_device(deviceInfo, Rooms);
    },
    store_pairedDevice(data) {
      return _storeInfo(data);
    },
    fetch_pairedDevice() {
      return _fetch_pairedDevice();
    },
    fetch_rooms() {
      return _fetch_rooms();
    },
    fetch_schedule() {
      return _fetch_schedule();
    },
    getSchedule() {
      return _getSchedule();
    },
    storeCamera_info() {
      return _storeCamera_info;
    },
    // scanner_webcam(deviceId) {
    //   return _scanner_webcam(deviceId);
    // },
    scanner(camera) {
      return _scanner(camera);
    },
    openOtherScanner(camera, index) {
      return _openOtherScanner(camera, index);
    },
    closeOtherScanner(deviceId) {
      return _closeOtherScanner(deviceId);
    },
    room_webcam(constraints, video) {
      return _room_webcam(constraints, video);
    },
    // sendAttendance() {
    //   return _sendAttendance();
    // },
    config_setting(device, label, deviceId) {
      return _config_setting(device, label, deviceId);
    },
    new_pairDevice(item) {
      return _new_PairDevice(item);
    },
  };
})();

// console.log(devices_list);
const UIController = (function (APICtrl) {
  const DomElement = {
    scanner_video: "#scanner_camera",
    scanner_container: ".camera-container",
    // selfieCapture_button: "#snapShot",
    selfieCapture_container: "#snapShot_container",
    mainCamera_image_result: "#scanner_result_container",
    // room_option: "#Room",
    room_cameras: ".camera_list",
    // open_camera: "#open_camera_perRoom",
    deviceId: "#deviceId",
    faculty_input: "#faculty",
    attendance_input: "#status",
    sync: "#sync_submit",
    closeModal: ".close",
    setting_container: "#setting-container",
    setting: "#setting-body",
    setting_submit: "#save-settings",
  };
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
  return {
    tags() {
      return {
        video: document.querySelector(DomElement.scanner_video),

        setting: document.querySelector(DomElement.setting),
        image_result: document.querySelector(
          DomElement.mainCamera_image_result
        ),
        setting_container: document.querySelector(DomElement.setting_container),
      };
    },
    inputField() {
      return {
        faculty_qr: document.querySelector(DomElement.faculty_input).value,
        attendance_status: document.querySelector(DomElement.attendance_input)
          .value,
        // room_options: document.querySelector(DomElement.room_option),
      };
    },
    button() {
      return {
        // selfie_button: document.querySelector(DomElement.selfieCapture_button),
        // open_camera: document.querySelector(DomElement.open_camera),
        sync_camera: document.querySelector(DomElement.sync),
        save_setting: document.querySelector(DomElement.setting_submit),
      };
    },
    room_camera_container(index, faculty_id, room_num) {
      const html = `<div id="${room_num}">
                  <video id="scanner_camera_${index}" data-faculty="${faculty_id}"  data-attach="camera ${index}" class="mx-2 video" autoplay></video>
                  <div id="result_container_${index}" class="img_result" ></div>
                  </div>`;
      document
        .querySelector(DomElement.room_cameras)
        .insertAdjacentHTML("beforeend", html);
    },

    room_camera(index, deviceId) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        var constraints = {
          video: {
            deviceId: {
              exact: deviceId,
            },
          },
        };
        // console.log(constraints_1.deviceId);
        var video = document.querySelector(
          `${DomElement.scanner_video}_${index}`
        );
        APICtrl.room_webcam(constraints, video);
      } else {
        console.error("getUserMedia is not supported in this browser");
      }
    },

    setting(room_name, index) {
      const html = `<div class="d-flex justify-content-between align-items-center mb-3">
      <div> <span class="fw-semibold">device : </span> <span id="room_name">${room_name}</span></div>
      <input type="hidden" id="setting-input">
        <div id="setting-container">
        <select class="form-select" aria-label="Default select example" id="setting-body_${index}">
        <option selected>Open this select menu</option>

       </select>
        </div>
      </div>`;
      document
        .querySelector(DomElement.setting)
        .insertAdjacentHTML("afterbegin", html);
    },

    generate_image(video_id) {
    // generate_image(video_id) {
      let time_created = timeFormat.currentTime.format(timeFormat.date());
      let date_created = timeFormat.currentDay.format(timeFormat.date());

      var canvas = document.createElement("canvas");
      let data_time = `${date_created}  :  ${time_created}`;
      // const video = document.querySelector(video_id);
      const videos = document.querySelectorAll(`${video_id}`);
      let playingVideos = [];
      const images = [];
     
      

      videos.forEach(video => {
        // Check if the video is currently playing
        if (!video.paused) {
          playingVideos.push(video);
        }
      });
      if (playingVideos.length > 0) {
    
        playingVideos.forEach(video => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "white";
          ctx.font = "20px Arial";
          ctx.fillText(data_time, 20, 40);
          var dataUrl_1 = canvas.toDataURL();
          images.push(dataUrl_1);
        });
    
      }
      return images;
    },
    
    storeDevideId(value) {
      document.querySelector(DomElement.deviceId).value = value;
    },
    getdeviceId() {
      return {
        id: document.querySelector(DomElement.deviceId).value,
      };
    },
    toTextBox(qrID) {
      document.getElementById("faculty").value = qrID.toString();
      document.getElementById("subbtn").click();
    },
  };
})(APIController);

const APPController = (function (APICtrl, UICtrl) {
  const DomCtrl = UICtrl.button();
  const DomInputs = UICtrl.inputField();
  let index = 0;

  //fetch room from database and store it to a json file
  const fetch_rooms = () => {
    APICtrl.fetch_rooms();
  };

  
  // const autoCapture =  function(){
  //  return {
  //   capture(index){
       
  //     },
  //  }
  // }


  const UInterface = async () => {
    const paired_Device = await APICtrl.fetch_pairedDevice();

    //main scanner
    paired_Device.forEach(async (device) => {
      if (device.device === "Scanner") {
        const scan = await APICtrl.scanner(device.deviceId);
        scan.addListener("scan", (content) => {
          UICtrl.toTextBox(content.toString());
        });
      }
    });

    //select device device and deviceId from browser generated device info
    const new_setting = [];

    paired_Device.forEach((device, index) => {
      // if (device.device !== "Scanner" && device.status !== "0") {
      //   UICtrl.room_option(device.Room_name, device.deviceId);
      // }
      UICtrl.setting(device.device, index);

      const setting_select = document.getElementById("setting-body_" + index);

      setting_select.addEventListener("change", async function () {
        const input = $(this).parent().parent().children("input");
        const label = $(this).children("option:selected").text();

        const deviceId = $(input).val(this.value);
        const id = $(deviceId).val();

        const info = await APICtrl.config_setting(device.device, label, id);
        new_setting.push(info);
      });
    });

    DomCtrl.save_setting.addEventListener("click", async () => {
      try {
        await APICtrl.store_pairedDevice(new_setting);
        location.reload();
      } catch (error) {
        console.error(error);
      }
    });

    for (var i = 0; i < paired_Device.length; i++) {
      // Create a select element

      // Append select element to container
      var selectContainer = document.getElementById("setting-body_" + i);

      // Append options to the select element
      for (var j = 0; j < paired_Device.length; j++) {
        var option = document.createElement("option");
        option.text = paired_Device[j].label;
        option.value = paired_Device[j].deviceId;
        selectContainer.add(option);
      }
    }
    // await APICtrl.sendAttendance();

    // $("#attendance").submit(function (e) {
    //   e.preventDefault();
    //   var attendance = $(this).serialize();
    //   const img_id = "scanner_image";
    //   $.ajax({
    //     type: "POST",
    //     url: "attendance.php",
    //     data: attendance,
    //     dataType: "json",
    //     success: function (response) {
    //       $("#facultyId").val(response.facultyId);
    //       if (response.error) {
    //         $(".alert").hide();
    //         $(".alert-danger").show();
    //         $(".message").html(response.message);
    //       } else {
    //         $(".alert").hide();
    //         $(".alert-success").show();
    //         $(".message").html(response.message);

    //         // $("#faculty").val("");
    //         setTimeout(() => {
    //           UICtrl.generate_image(
    //             `#result_container_${index}`,
    //             "webcam",
    //             `#scanner_camera_${index}`
    //           );
    //         }, 5000); //5s before capture
    //       }
    //       setTimeout(() => {
    //         $(".alert").hide();
    //       }, 2000);
    //     },
    //     catch: (err) => {
    //       console.log(err.message);
    //     },
    //   });
    // });

    const sched_arr = await time_conversion();
    const targetTime = new Date();
    let index = 0;
    var interval = "15000";
    var timeout = "10100";
  
    function uploadVideoImages(video_id,faculty_id) {
      const images = UICtrl.generate_image(video_id);
    
      if (images) {
        images.forEach(image => {
          Webcam.upload(image, "./selfieCapture.php", function(code, text) {
            console.log('Image uploaded with status ' + code + ': ' + text);
          });
        });
        // $.ajax({
        //   url: "selfieCapture.php",
        //   type: "POST",
        //   data: { faculty: faculty_id },
        // });
      }
    }
    
    setInterval(() => {
      uploadVideoImages('.video',facultyId)
    }, interval);
    function open_cam(room, facultyId) {

   

      paired_Device.forEach((device) => {
     
        if (device.Room_name === room) {
          console.log(device.deviceId);
          const open = new Promise((resolve,reject)=>{
            const deviceId = device.deviceId
            resolve(deviceId)
          })
          open.then((deviceId)=>{
            index++;
            //generate webcam video container
            UICtrl.room_camera_container(index, facultyId, facultyId);
            //set webcam visual
            UICtrl.room_camera(index, deviceId); 
         })  
        }
      })
    }

    function close_cam(room, facultyId) {
        var parent = document.querySelector(".camera_list");
        var child = document.querySelector(`#${facultyId}`);
        var video = document.querySelector(`[data-faculty ="${facultyId}"]`)
        
        console.log("executed_successfully");
        if (parent && child) {
          paired_Device.forEach(async (device) => {
            if (device.Room_name === room) {
              var constraints = {
                video: {
                  deviceId: {
                    exact: device.deviceId,
                  },
                },
              };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const tracks = stream.getTracks()
          console.log(tracks);
          tracks.forEach((track)=>{
            if(track.kind ==="video"){
              if(track.enabled){
                track.stop();
                track.enabled = false;
              }
            }
            video.srcObject = null;
            video.stop;
          })
        })
        .catch(function (error) {
          console.log(constraints);
          console.log(error);
        });

          parent.removeChild(child);
        }
          });
        } else {
          console.log("Parent or child element not found.");
        }
    }

    sched_arr.forEach(({ lecture, laboratory }) => {
      const lecture_obj = lecture;
      const laboratory_obj = laboratory;
      Object.entries(lecture).forEach(([key, value]) => {
        Object.entries(value).forEach(([key, value]) => {
          if (key === "start") {
            let room = lecture_obj["info"].room;
            let faculty_id = lecture_obj["info"].faculty;
            let hour = value.hour;
            let mins = value.mins;
            // console.log(value);
            lecture_obj["time"].start.targetTime = targetTime.setHours(
              hour,
              mins,
              0,
              0
            );

            setInterval(() => {
              // console.log(start_time);;
              const currentTime = new Date().toLocaleTimeString("en-US", {
                hour12: false,
              });

              let start_time = new Date(value.targetTime).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                }
              );

              if (currentTime === start_time) {
                try {
                  
                  open_cam(room, faculty_id);
                

                } catch (error) {
                  console.log(error);
                }
              }
            }, 1000);
          }
          if (key === "end") {
            let room = lecture_obj["info"].room;
            let faculty_id = lecture_obj["info"].faculty;
            let hour = value.hour;
            let mins = value.mins;
            // console.log(value);
            lecture_obj["time"].end.targetTime = targetTime.setHours(
              hour,
              mins,
              0,
              0
            );

            setInterval(() => {
              // console.log(start_time);;
              const currentTime = new Date().toLocaleTimeString("en-US", {
                hour12: false,
              });

              let end_time = new Date(value.targetTime).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                }
              );
              // function open_cam(room) {}
              if (currentTime === end_time) {
                close_cam(room, faculty_id);
                console.log("close");
              }
            }, 1000);
          }
        });
      });
      Object.entries(laboratory).forEach(([key, value]) => {
        Object.entries(value).forEach(([key, value]) => {
          if (key === "start") {
            let room = laboratory_obj["info"].room;
            let faculty_id = laboratory_obj["info"].faculty;
            let hour = value.hour;
            let mins = value.mins;
            // console.log(value);
            laboratory_obj["time"].start.targetTime = targetTime.setHours(
              hour,
              mins,
              0,
              0
            );

            setInterval(() => {
              // console.log(start_time);;
              const currentTime = new Date().toLocaleTimeString("en-US", {
                hour12: false,
              });

              let start_time = new Date(value.targetTime).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                }
              );

              if (currentTime === start_time) {
                try {
                  
                  open_cam(room, faculty_id);
                

                } catch (error) {
                  console.log(error);
                }
              }
            }, 1000);
          }
          if (key === "end") {
            let room = laboratory_obj["info"].room;
            let faculty_id = laboratory_obj["info"].faculty;
            let hour = value.hour;
            let mins = value.mins;
            // console.log(value);
            laboratory_obj["time"].end.targetTime = targetTime.setHours(
              hour,
              mins,
              0,
              0
            );

            setInterval(() => {
              // console.log(start_time);;
              const currentTime = new Date().toLocaleTimeString("en-US", {
                hour12: false,
              });

              let end_time = new Date(value.targetTime).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                }
              );
              // function open_cam(room) {}
              if (currentTime === end_time) {
                close_cam(room, faculty_id);
                console.log("close");
              }
            }, 1000);
          }
        });
      });
    });
  };

  const time_conversion = async () => {
    const schedule = await APICtrl.fetch_schedule();
    // const paired_Device = await APICtrl.fetch_pairedDevice();
    const sched_arr = [];

    schedule.forEach((sched) => {
      const { facultyID, time_lab, time_lec, lab_room_name, lec_room_name } =
        sched;

      let lec_start_time = time_lec.slice(0, 9).toString();
      let lec_end_time = time_lec.slice(14, 22).toString();
      let lab_start_time = time_lab.slice(0, 9).toString();
      let lab_end_time = time_lab.slice(14, 22).toString();


      const schedulels = {
        lecture: {
          time: {
            start: {
              hour: lec_start_time.slice(0, 2),
              mins: lec_start_time.slice(3, 5),
            },
            end: {
              hour: lec_end_time.slice(0, 2),
              mins: lec_end_time.slice(3, 5),
            },
          },
          info: {
            faculty: facultyID,
            room: lec_room_name,
          },
        },
        laboratory: {
          time: {
            start: {
              hour: lab_start_time.slice(0, 2),
              mins: lab_start_time.slice(3, 5),
            },
            end: {
              id: 3,
              hour: lab_end_time.slice(0, 2),
              mins: lab_end_time.slice(3, 5),
            },
          },
          info: {
            faculty: facultyID,
            room: lab_room_name,
          },
        },
      };
      sched_arr.push(schedulels);
    });
    return sched_arr;
  };

  

  DomCtrl.sync_camera.addEventListener("click", async () => {
    //get Webcams Details
    const webcams_info = await APICtrl.storeCamera_info();
    //get Room Details
    const rooms_detail = await APICtrl.fetch_rooms();
    //pairedDevice and Rooms
    const pairedDevice = await APICtrl.pairingDevice(
      webcams_info,
      rooms_detail
    );
    await APICtrl.store_pairedDevice(pairedDevice); //send info to fetchRoomList.php
  });


  return {
    init() {
      fetch_rooms();
      UInterface();
    },
  };
})(APIController, UIController);

APPController.init();