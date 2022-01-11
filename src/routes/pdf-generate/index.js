const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const generateTimetableAPI = require('../../../timetable-generator/generator');

router.post('/generate-timetable', async (req, res) => {
	try {
		let { scheduledCourses } = await generateTimetableAPI(req.body);
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		const pageHTML = setUpTimetableTemplate(scheduledCourses);
		await page.setContent(pageHTML);

		const pdfBuffer = await page.pdf({ format: 'A4' });

		await page.close();
		await browser.close();

		res.set('Content-Type', 'application/pdf');
		res.send(pdfBuffer);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

const setUpTimetableTemplate = (scheduledCourses) => {
	const templateHTML = fs.readFileSync(path.join(__dirname, 'timetable.html'), 'utf8');
	const mainHTML = ejs.render(templateHTML, {
		userName: 'NILANJAN',
		resetToken: 'TOKEN',
	});

	return mainHTML;
};

module.exports = router;
