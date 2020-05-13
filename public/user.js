//button api listener to send api request from client side and receive response from server side
const button = document.getElementById('myButton');
button.addEventListener('click', function(e) {

  fetch('/clicked', {method: 'POST'})
    .then(function(response) {
      if(response.ok) {
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
});

