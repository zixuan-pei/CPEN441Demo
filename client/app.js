// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM (elem){
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
    let template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}

function timeToString(time) {
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return h + ':' + m + ':' + s;
}

let Service = {
    origin: window.location.origin,
    getTravelInfo: () => {
        return new Promise((resolve, reject) => {
            let x = new XMLHttpRequest();
            x.open("GET", Service.origin + "/getInfo");
            x.onload = () => {
                if (x.status === 200)
                    resolve(JSON.parse(x.responseText));
                else
                    reject(new Error(x.responseText));
            }
            x.onerror = () => {
                reject(new Error("Client Error."));
            };
            x.send();
        });
    },
    setInfo: data => {
        return new Promise((resolve, reject) => {
            let x = new XMLHttpRequest();
            x.open("POST", Service.origin + "/setInfo");
            x.onload = () => {
                if (x.status === 200)
                    resolve(JSON.parse(x.responseText));
                else
                    reject(new Error(x.responseText));
            }
            x.onerror = () => {
                reject(new Error("Client Error."));
            };
            x.setRequestHeader("Content-Type", "application/json");
            x.send(JSON.stringify(data));
        });
    },
    getTime: () => {
        return new Promise((resolve, reject) => {
            let x = new XMLHttpRequest();
            x.open("GET", Service.origin + "/getTime");
            x.onload = () => {
                if (x.status === 200)
                    resolve(JSON.parse(x.responseText));
                else
                    reject(new Error(x.responseText));
            }
            x.onerror = () => {
                reject(new Error("Client Error."));
            };
            x.send();
        });
    },
    resetTime: () => {
        return new Promise((resolve, reject) => {
            let x = new XMLHttpRequest();
            x.open("GET", Service.origin + "/resetTime");
            x.onload = () => {
                if (x.status === 200)
                    resolve(JSON.parse(x.responseText));
                else
                    reject(new Error(x.responseText));
            }
            x.onerror = () => {
                reject(new Error("Client Error."));
            };
            x.send();
        });
    }
}

let meetingTime = new Date('December 2, 2021 12:30:00');
let time, weather = 'sunny';
let departTime = new Date('December 2, 2022 12:30:00');

setInterval(() => {
    Service.getTime().then(t => {
        time = t;
    });
}, 1000);

class MainPage {
    constructor() {
        this.elem = createDOM(`
            <div>
                <div><a href = "#/currentApp">Current app</a></div>
                <div><a href = "#/ourApp">Our app</a></div>
                <div><a href = "#/weather">Weather</a></div>
                <div><a href = "#/control">Control</a></div>
            </div>`);
    }
}

class OurApp {
    constructor() {
        this.elem = createDOM(`
            <div id="ourApp">
                <div>
                    <span id="currTime">Current time: </span>
                </div>
                <div>
                    <span id="ourTime">Estimated departure time: </span>
                </div>
                <div>
                    <span id="ourWeather">Weather: </span>
                </div>
                <div>
                    <button id = 'd'>Depart</button>
                </div>
            </div>`);
        this.currtime = this.elem.querySelector("#currTime");
        this.time = this.elem.querySelector("#ourTime");
        this.weather = this.elem.querySelector("#ourWeather");
        this.departButton = this.elem.querySelector("#d");

        this.departButton.addEventListener("click", () => {
            Service.getTravelInfo().then(info => {
                let timeOnRoad = info.distance / info.speed;
                let estimate = new Date(meetingTime - timeOnRoad * 60000);
                // console.log(estimate);
                let actual = new Date(time);
                if (actual <= estimate){
                    alert("Congrats. You are on time!");
                }else {
                    alert("OH-HO. You are late!")
                }
            })
        })
    }

    refresh() {
        Service.getTravelInfo().then(info => {
            let timeOnRoad = info.distance / info.speed;
            departTime = new Date(meetingTime - timeOnRoad * 60000);
            this.time.innerText = 'Estimated departure time: ' + timeToString(departTime);
            let weatherMessage;
            if(info.weather === 'snow')
                weatherMessage = 'Today\'s temperature is -1 ~ 2.';
            else if(info.weather === 'sunny')
                weatherMessage = 'Today\'s temperature is 20 ~ 24.';
            else if(info.weather === 'rain')
                weatherMessage = 'Today\'s temperature is 8 ~ 12.'
            this.weather.innerText = 'Weather: ' + info.weather + '\n' + weatherMessage;
            weather = info.weather;
            this.currtime.innerText = 'Current time: ' + timeToString(new Date(time));
        })
    }
}

class CurrApp {
    constructor() {
        this.elem = createDOM(`
            <div id="currApp">
                <div id="timeSpan">
                    <span id="currTime">Current time: </span>
                </div>
                <div>
                    <label>From: </label>
                    <input id = "from" type="text"/>
                    <span>Type "1234 This St"</span>
                </div>
                <div>
                    <label>To: </label>
                    <input id = "to" type="text"/>
                    <span>Type "4321 That St"</span>
                </div>
                <div>
                    <button id = 's'>Search</button>
                </div>
                <div>
                    <span id="currAppDepartTime">Estimated departure time: </span>
                </div>
                <div>
                    <button id = 'd'>Depart</button>
                </div>
            </div>`);
        this.currtime = this.elem.querySelector("#currTime");
        this.fromElem = this.elem.querySelector("#from");
        this.toElem = this.elem.querySelector("#to");
        this.searchButton = this.elem.querySelector("#s");
        this.spanElem = this.elem.querySelector("#currAppDepartTime");
        this.spanParent = this.elem.querySelector('#timeSpan');
        this.departButton = this.elem.querySelector("#d");

        this.searchButton.addEventListener("click", () => {
            if(this.fromElem.value === '1234 This St' && this.toElem.value === '4321 That St')
                this.search();
            else
                alert("Result not found, please try again.");
            // this.fromElem.value = '';
            // this.toElem.value = '';
        });

        this.departButton.addEventListener("click", () => {
            Service.getTravelInfo().then(info => {
                let timeOnRoad = info.distance / info.speed;
                let estimate = new Date(meetingTime - timeOnRoad * 60000);
                // console.log(estimate);
                let actual = new Date(time);
                if (actual <= estimate){
                    alert("Congrats. You are on time!");
                }else {
                    alert("OH-HO. You are late!")
                }
            })
        })
    }

    search() {
        Service.getTravelInfo().then(info => {
            let timeOnRoad = info.distance / info.speed;
            departTime = new Date(meetingTime - timeOnRoad * 60000);
            // console.log(departTime);
            this.spanElem.innerText = 'Estimated departure time: ' + timeToString(departTime);
        })
    }

    refresh() {
        this.currtime = document.createElement('span');
        this.currtime.innerText = 'Current time: ' + timeToString(new Date(time));
        emptyDOM(this.spanParent);
        this.spanParent.appendChild(this.currtime);
    }
}

class Weather {
    constructor() {
        this.elem = createDOM(`
            <div>
                <div>
                    <span id="weather">Weather: </span>
                </div>
            </div>`);
        // this.currtime = this.elem.querySelector("#currTime");
        // this.time = this.elem.querySelector("#ourTime");
        this.weather = this.elem.querySelector("#weather");
    }

    refresh() {
        Service.getTravelInfo().then(info => {
            let weatherMessage;
            if(info.weather === 'snow')
                weatherMessage = 'Today\'s temperature is -1 ~ 2.';
            else if(info.weather === 'sunny')
                weatherMessage = 'Today\'s temperature is 20 ~ 24.';
            else if(info.weather === 'rain')
                weatherMessage = 'Today\'s temperature is 8 ~ 12.'
            this.weather.innerText = 'Weather: ' + info.weather + '\n' + weatherMessage;
            weather = info.weather;
        })
    }
}

class Control {
    constructor(socket) {
        this.elem = createDOM(`
            <div id="ourApp">
                <div>Choose weather</div>
                <div>
                    <button id="sunny">Sunny</button>
                    <button id="rain">Rain</button>
                    <button id="snow">Snow</button>
                </div>
                <div>Traffic control</div>
                <div>
                    <button id="enable">Enable Traffic Jam</button>
                    <button id="disable">Disable Traffic Jam</button>
                </div>
            </div>`);
        this.sunny = this.elem.querySelector("#sunny");
        this.rain = this.elem.querySelector("#rain");
        this.snow = this.elem.querySelector("#snow");
        this.enable = this.elem.querySelector("#enable");
        this.disable = this.elem.querySelector("#disable");
        this.sunny.addEventListener("click", () => {
            let info = {weather: 'sunny', speed: 0.25};
            Service.setInfo(info).then(response => {
                console.log(response);
            });
        });

        this.rain.addEventListener("click", () => {
            let info = {weather: 'rain', speed: 0.23};
            Service.setInfo(info).then(response => {
                console.log(response);
            });
        });

        this.snow.addEventListener("click", () => {
            let info = {weather: 'snow', speed: 0.21};
            Service.setInfo(info).then(response => {
                console.log(response);
            });
        });

        this.enable.addEventListener("click", () => {
            let info = {trafficJam: true, distance: 6.5};
            Service.setInfo(info).then(response => {
                console.log(response);
            });
        });

        this.disable.addEventListener("click", () => {
            let info = {trafficJam: false, distance: 5};
            Service.setInfo(info).then(response => {
                console.log(response);
            });
        });
    }
}

function main() {
    let weatherPage = new Weather();
    let ourApp = new OurApp();
    let currApp = new CurrApp();
    let control = new Control();
    let mainPage = new MainPage();
    let renderRoute = () => {
        let url = window.location.hash;
        let pageView;
        let ret;
        if(url === '#/') {
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild(mainPage.elem);
            clearInterval(ret);
        } else if(url.includes('ourApp')) {
            ret = setInterval(() => {
                if (departTime <= new Date(time).setMinutes(new Date(time).getMinutes() + 1)) {

                    /* Alert message */
                    let alertMessage = "You should leave at " + timeToString(departTime);
                    if (weather === 'snow')
                        alertMessage += ". It is snowing outside. Wear clothes and bring an umbrella.";
                    else if (weather === 'rain')
                        alertMessage += ". It is raining outside. Bring an umbrella.";
                    else if (weather === 'sunny')
                        alertMessage += ". It's sunny outside. Have a nice day!";

                    /* Alert audio */
                    // let alertAudio = document.createElement('audio');
                    // alertAudio.src = 'alertAudio.mp3';
                    // alertAudio.autoplay = true;
                    // ourApp.elem.appendChild(alertAudio);
                    // alertAudio.play().then();
                    // setTimeout(() => {
                    //     alertAudio.parentNode.removeChild(alertAudio); console.log(ourApp.elem);
                    // }, 3000);
                    // console.log(alertAudio);
                    // console.log(ourApp.elem);

                    /* Alert */
                    alert(alertMessage);
                    clearInterval(ret);
                }
            }, 1000);
            ourApp.refresh();
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild(ourApp.elem);
        } else if(url.includes('currentApp')) {
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild(currApp.elem);
            clearInterval(ret);
        } else if(url.includes('control')) {
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild(control.elem);
            clearInterval(ret);
        } else if(url.includes('weather')) {
            weatherPage.refresh();
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild( weatherPage.elem);
            clearInterval(ret);
        }
    };
    let renderInfo = () => {
        let url = window.location.hash;
        let pageView;
        if(url.includes('ourApp')) {
            ourApp.refresh();
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild(ourApp.elem);
        }
    }
    let renderWeather = () => {
        let url = window.location.hash;
        let pageView;
        if(url.includes('weather')) {
            weatherPage.refresh();
            pageView = document.getElementById("page");
            emptyDOM(pageView);
            pageView.appendChild( weatherPage.elem);
        }
    }
    let refreshTime = () => {
       currApp.refresh();
    }
    window.addEventListener("popstate", renderRoute);
    renderRoute();
    setInterval(renderInfo, 1000);
    setInterval(renderWeather, 1000);
    setInterval(refreshTime, 1000);
}

window.addEventListener("load", main);