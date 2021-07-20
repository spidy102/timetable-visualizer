if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const DeviceDetector = require('node-device-detector');
const DeviceHelper = require('node-device-detector/helper');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
const courseRoutes = require('./src/routes/courses');

// create middleware
const middlewareDetect = (req, res, next) => {
	const detector = new DeviceDetector();
	const userAgent = req.headers['user-agent'];
	const result = detector.detect(userAgent);
	const { client } = result;
	req.deviceInfo = result;

	if (client.type === 'browser') next();
	else res.status(403).end();
};

app.use(express.json());
app.use('/api/v1/courses', courseRoutes);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(__dirname + '/prod/desktop'));
	app.get('*', middlewareDetect, async (req, res) => {
		if (DeviceHelper.isDesktop(req.deviceInfo)) {
			res.sendFile(__dirname + '/prod/desktop/index.html');
		} else {
			res.send('<h3>Work in Progress for Mobile Devices</h3>');
		}
	});
}

app.listen(PORT, async () => {
	await connectDB();
	console.log(`Server started on port ${PORT}`);
});
