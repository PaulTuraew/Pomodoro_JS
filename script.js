/*
 * GLOBAL VARIABLES
 */

var defaultTaskTime = 25000, //default 25 seconds
    defaultBreakTime = 5000, //default 5 seconds
    deltaTaskTime = 5000,
    deltaBreakTime = 1000,
    loopFrequencyInMilliseconds = 10, //loop fires every 10 milliseconds

    taskTime,
    breakTime,
    isTimerRunning,
    lastLoopSystemTime,

    taskTimeDisplay,
    breakTimeDisplay,
    controlsDisplay;

/*
 * MODEL - Stores data for the app
 */

function modelInit() {
    //set model variables (currently global)
    //time is in milliseconds
    setTaskTime(defaultTaskTime);
    setBreakTime(defaultBreakTime);
    //set up controls
    setTimerRunning(false);
}

function setTimerRunning(runTimer) {
    isTimerRunning = runTimer; //expect a boolean as argument
    updateControls();
}

function setTaskTime(newTime) {
    //this changes the taskTime
    if (newTime < 0) {
        newTime = 0;
    }
    taskTime = newTime;
    updateTime();
}

function setBreakTime(newTime) {
    //this changes the breakTime
    if (newTime < 0) {
        newTime = 0;
    }
    breakTime = newTime;
    updateTime();
}


function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100, 10),
        seconds = parseInt((duration / 1000) % 60, 10),
        minutes = parseInt((duration / (1000 * 60)) % 60, 10),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}


/*
 * VIEW - Renders the MODEL to the user
 */

function updateTime() {
    //call a display function based on model state
    //this is the view logic (when model changes, this is the delegator function)
    // Qs to ask, if Yes to both, update View
    //has the model changed?
    //is the timer running?
    displayTime();
}

function updateControls() {
    var controls;
    //while loop is going, display stop button
    //while loop is stopped, display timer adjusters and continue button
    //can be done with if (isTimerRunning){} else {}
    if (isTimerRunning) {
        controls = getTimerRunningHtml();
    } else {
        controls = getTimerStoppedHtml();
    }
    displayControls(controls);
}

function displayTime() {
    //change the actual HTML display
    //insert the time into the #taskTime HTML element
    taskTimeDisplay.innerHTML = msToTime(taskTime);
    //insert the time into the #breakTime HTML element
    breakTimeDisplay.innerHTML = msToTime(breakTime);
}

function getTimerStoppedHtml() {
    var controls = "<button id='start'>Start Timer</button>";
    controls += "<button id='reset'>Reset Timer</button>";
    controls += "<button id='addTaskTime'>(+)</button>";
    controls += "<button id='substractTaskTime'>(-)</button>";
    return controls;
}

function getTimerRunningHtml() {
    var controls = "<button id='stop'>Stop Timer</button>";
    return controls;
}

function displayControls(controls) {
    //display various controls based on the arguments given
    controlsDisplay.innerHTML = controls; //here, "controls" is an attribute
    //notify controller that the view has changed
    updateEventListeners();
}

/*
 * CONTROLLER - Updates the MODEL when user manipulates VIEW / Updates VIEW when MODEL changes
 */

function timerInit() {
    //set the lastLoopSystemTime to now
    lastLoopSystemTime = Date.now();
    //start the loop
    timerLoop();
}

function timerLoop() {
    //main controller for the app

    //figure out the elapsed time
    //and reassign lastLoopSystemTime
    var timeNow = Date.now(),
        elapsedTime = timeNow - lastLoopSystemTime;
    lastLoopSystemTime = timeNow;
    //if timer is running,
    //if taskTime > 0 then we are dealing with taskTime countdown
    //else we are dealing with breakTime countdown
    //reduce either taskTime or breakTime by some step amount
    //when both taskTime and breakTime are zero, stop timer
    if (isTimerRunning) {
        if (taskTime > 0) {
            setTaskTime(taskTime - elapsedTime);
        } else if (breakTime > 0) {
            setBreakTime(breakTime - elapsedTime);
        } else {
            //both are zero; fire stop event
            //and exit timerLoop function right here
            stopButtonClicked();
            return;
        }
        //either taskTime or breakTime is still running,
        //set up recursive timer
        setTimeout(timerLoop, loopFrequencyInMilliseconds);
    }
}

function taskTimePlusClicked() {
    //call functions from the model ("setTaskTime and setBreakTime") here
    var newTaskTime = parseInt(taskTime, 10) + deltaTaskTime,
        newBreakTime = parseInt(breakTime, 10) + deltaBreakTime;
    setTaskTime(newTaskTime);
    setBreakTime(newBreakTime);
}

function taskTimeMinusClicked() {
    //call functions from the model here
    var newTaskTime = parseInt(taskTime, 10) - deltaTaskTime,
        newBreakTime = parseInt(breakTime, 10) - deltaBreakTime;
    setTaskTime(newTaskTime);
    setBreakTime(newBreakTime);
}

function startButtonClicked() {
    //user has clicked the start (or continue) button
    //start timer clock
    setTimerRunning(true);
    //enter into the main loop
    timerInit();
}

function stopButtonClicked() {
    //user has clicked the stop button
    //stop timer clock
    setTimerRunning(false);
}

function resetButtonClicked() {
    modelInit();
}

function updateEventListeners() {
    var startButton = document.getElementById("start"),
        stopButton = document.getElementById("stop"),
        resetButton = document.getElementById("reset"),
        addTimeButton = document.getElementById("addTaskTime"),
        subtractTimeButton = document.getElementById("substractTaskTime");

    if (startButton) {
        startButton.addEventListener("click", startButtonClicked);
    }
    if (stopButton) {
        stopButton.addEventListener("click", stopButtonClicked);
    }
    if (resetButton) {
        resetButton.addEventListener("click", resetButtonClicked);
    }
    if (addTimeButton) {
        addTimeButton.addEventListener("click", taskTimePlusClicked);
    }
    if (subtractTimeButton) {
        subtractTimeButton.addEventListener("click", taskTimeMinusClicked);
    }
}

/*
 * RUNTIME
 */

//The DOMContentLoaded event is fired when the document has been completely loaded and parsed, without waiting for   
//stylesheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", function (event) {
    //set DOM variables to help with processing time - reference a variable (here) instead of finding
    // elementByID every time (in displayControls and displayTime - VIEW).
    taskTimeDisplay = document.getElementById("taskTime");
    breakTimeDisplay = document.getElementById("breakTime");
    controlsDisplay = document.getElementById("controls");

    modelInit(); //starting point of app
});