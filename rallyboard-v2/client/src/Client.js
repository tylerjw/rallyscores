import openSocket from 'socket.io-client';
const socket = openSocket('http://rallyscores.com:80');

function getEvents(cb) {
  return fetch("/api/events", {
    accept: "application/json"
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function getRaEvent(year, code, cb) {
  let url = "/api/ra/" + year + "/" + code;
  console.log('requesting: ' + url);
  return fetch(url, {accept: "application/json"}
    ).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function updateRaEvent(year, code, cb) {
  let url = "/api/ra/update/" + year + "/" + code;
  console.log('requesting: ' + url);
  return fetch(url, {accept: "application/json"}
    ).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function subscribeToStatus(cb) {
  socket.on('status', status => cb(null, status));
  socket.emit('subscribeToStatus', 1000);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(response) {
  return response.json();
}

function getJobStatus(jobid, status) {
  if (status.status !== "ok") {
    return status.status
  }

  let jobStatus = "unknown";

  for (let i in status.running) {
    if (jobid === status.running[i].id) {
      jobStatus = "running";
    }
  }

  for (let i in status.finished) {
    if (jobid === status.finished[i].id) {
      jobStatus = "finished";
    }
  }

  for (let i in status.pending) {
    if (jobid === status.pending[i].id) {
      jobStatus = "pending";
    }
  }

  return jobStatus;
}

export { getEvents, getRaEvent, updateRaEvent, subscribeToStatus, getJobStatus };
