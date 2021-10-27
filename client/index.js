

document.forms.login.addEventListener('submit', async (event) => {
    event.preventDefault();
    let user = {
        mail: event.target.mail.value,
        password: event.target.password.value
    };
    console.log(user);
    data =  {
      confirmed: [
        '616b084269e5eb37fffb4990',
        '616b07fa69e5eb37fffb498e'
      ],
      disconfirmed: [
        '616b083e69e5eb37fffb498f'
      ]
    } ;
    request('/api/works/confirmed', 'PATCH', data);
    });
document.forms.signin.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log(event.target.mail.value + ' ' + event.target.password.value);
})

async function request(url, method = 'GET', data = null) {
    try {
      const headers = {}
      let body
  
      if (data) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(data)
      }
  
      const response = await fetch(url, {
        method,
        headers,
        body
      })
      return await response.json()
    } catch (e) {
      console.warn('Error:', e.message)
    }
  }


