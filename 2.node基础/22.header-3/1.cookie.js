const http = require('http')
const querystring = require('querystring')
const crypto = require('crypto')
const secret = 'zhang'
// 签名方法，转化加密过后的base64编码
// Base64 有三个字符+、/和=，在 URL 里面有特殊含义，所以要被替换掉：=被省略、+替换成-，/替换成_ 。这就是 Base64URL 算法
const sign = (val) => {
  return crypto.createHmac('sha256', secret).update(val).digest("base64").replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

http.createServer((req, res) => {
  req.getCookie = function(key, opts={}) {
    let cookies = querystring.parse(req.headers['cookie'], '; ')
    let cookie = cookies[key]
    let [value, s] = cookie.includes('.') ? cookie.split('.') : [cookie]
    if(opts.signed) {
      if(sign(value) === s) {
        return value
      } else {
        return ''
      }
    }
    return value
  }

  let arr = []
  res.setCookie = function(key, value, option = {}) {
    let opts = []
    let cookie = `${key}=${value}`
    if(option.maxAge) {
      opts.push(`max-age=${option.maxAge}`)
    }
    if(option.domain) {
      opts.push(`domain=${option.domain}`)
    }
    if(option.httpOnly) {
      opts.push(`httpOnly=true`)
    }
    if(option.signed) {
      cookie = cookie + '.' + sign(value)
    }
    arr.push(`${cookie}; ${opts.join('; ')}`)
    res.setHeader('Set-cookie', arr)
  }
  if (req.url === '/read') {
    let age = req.getCookie('age', {
      signed: true
    })
    res.end(age)
  } else if(req.url === '/write') {
    res.setCookie('name', 'hzi', {
      maxAge: 10
    })
    res.setCookie('age', '16', {
      signed: true,
      httpOnly: true
    })
    res.end()
  } else {
    res.end()
  }
  
}).listen(3000)
