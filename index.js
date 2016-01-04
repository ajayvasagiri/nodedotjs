let http = require('http')
let fs = require('fs')
let request = require('request')
let through = require('through')

let argv = require('yargs')
    .default('host','127.0.0.1')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host == '127.0.0.1' ? 8000 : 80)

let destinationUrl = argv.url || scheme + argv.host + ':' + port


let logStream = argv.logfilepath ? fs.createWriteStream(argv.logfilepath) : process.stdout

http.createServer((req, res) => {
    console.log(`Request has been received at: ${req.url}`)
    for (let header in req.headers) {
      res.setHeader(header, req.headers[header])
    }
    res.setHeader("CustomHeader","WMT")

    req.pipe(res)
}).listen(8000)


http.createServer((req, res) => {
    let url = destinationUrl
    if(req.headers['x-destination-url']) {
        url = req.headers['x-destination-url']
    }
    console.log("url : " + url);
    let options = {
       headers: req.headers,
       url: url + req.url
    }
    logStream.write('\n\n\n Request' + JSON.stringify(req.headers))
    req.pipe(logStream, {end: false})
    let destinationResponse = req.pipe(request(options))
    
    destinationResponse.pipe(res)
    logStream.write('\n\n\n destinationResponse' + JSON.stringify(destinationResponse.headers))
    destinationResponse.pipe(logStream, {end: false})
}).listen(8001)

