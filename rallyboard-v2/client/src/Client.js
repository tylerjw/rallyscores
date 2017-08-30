function getEvents(cb) {
  return fetch("/api/events", {
    accept: "application/json"
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function getRaEvent(year, code, cb) {
  let url = "/api/ra/" + year + "/" + code;
  return fetch(url, {
    accept: "application/json"
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
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

export { getEvents, getRaEvent };
