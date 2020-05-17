const express = require('express');
const app = express();
const logger = require('morgan');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
// const cookieParser = require('cookie-parser')
const cookieParser = require('socket.io-cookie');

const port = process.env.PORT || 3000;

const whitelist = ['http://localhost:4200'];
const corsOptions = {
    credentials: true, // This is important.
    origin: (origin, callback) => {
        if (whitelist.includes(origin))
            return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    }
}

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

app.get('/user', (req, res) => {
    res.cookie('userData', 'sample_cookie');
});

io.use(cookieParser);

io.on('connection', async (socket) => {

    console.log(socket.handshake.address);
    const obj = {};

    obj['user-agent'] = socket.handshake.headers['user-agent'].toLowerCase();
    obj['sid'] = socket.id;
    obj['other'] = socket.handshake;
    // console.debug(obj['sid']);

    const qrCode = await generateQR('Sample');

    socket.emit('qrCode', { dataURL: qrCode });
    socket.on('msg', (data) => {
        console.log(data);
    });
});

const generateQR = async text => {
    try {
        const str = await QRCode.toDataURL(text);
        return str;
    } catch (err) {
        console.error(err)
        return "";
    }
}

http.listen(port, () => {
    console.log('Server running on port 3000');
});
