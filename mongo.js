const express = require('express');
const app = express();
const port = 8888;
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
})

app.listen(port, () => console.log(`Server running at localhost: ${port}!`))

const mongoose = require('mongoose');
const centreSchema = new mongoose.Schema({
	active: String,
    location_id: Number,
    location_name: String,
    operated_by: String,
    city: String,
    address: String,
    postal_code: String,
    province: String,
    phone: String
});
const appointmentSchema = new mongoose.Schema({
	location_id: Number,
	datetime: String,
	ohip: String,
	email: String
});

const centre = mongoose.model('Centre', centreSchema, 'vaccine');
const appointment = mongoose.model('Appointment', appointmentSchema);
const DataBase = 'mongodb://localhost:27017/covid19';
mongoose.connect(DataBase, {useNewUrlParser: true, useUnifiedTopology: true}).then(
	() => {
		app.get('/centre/list', (req, res) => {
			input = req.query;
			centre.find(input).then(result => { 
				res.send(result);
				}, err => { 
					res.send(err.message);
				})
			.catch( err => { 
				console.log(err);
				});
		});

		app.get('/appointment', (req, res) => {
			input = req.query;
			appointment.find(input).then(result => {
				res.send(result);
			}, err => {
				res.send(err.message);
			})
			.catch(err => {
				console.log(err);
			});
		});

		app.put('/appointment', (req, res) => {
			input = req.body.params;
			appointment.create(input)
					.then(result => {
						res.send({"message": 'Record added'});
						}, err => { res.send(err.message); } )
					.catch( err => { console.log(err); } );
		});

		app.post('/appointment', (req, res) => {
			input = req.body.params;
			appointment.updateOne({_id: input._id}, {
						$set: { ...input }
					}).then(result => {
						res.send({"message": "Update Success"})
						}, err => res.send(err.message))
					.catch( err => { console.log(err); } );
		});

		app.delete('/appointment', (req, res) => {
			input = req.query;
			if (input.all !== undefined) {
				appointment.deleteMany({
					location_id: parseInt(input.location_id)
				}).then(result => {
					res.send({"message": "Delete Success"})
				}, err => res.send(err.message))
				.catch(err => console.log(err));
			} else {
				appointment.deleteOne({
					_id: input._id
				}).then(result => {
					res.send({"message": "Delete Success"})
				}, err => res.send(err.message))
				.catch(err => console.log(err));
			}
		});

		app.get('/appointment/export', (req, res) => {
			let exec = require('child_process').exec
			let command = 'mongoexport -d covid19 -c appointments -o output.json'
			exec(command, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error}`);res.send(error);
				} else if (stderr) {
					console.log(`stderr: ${stderr}`);res.send(stderr);
				} else if (stdout) {
					console.log(`stdout: ${stdout}`);
					res.send(stdout);
				} else { 
					res.send('Error'); 
				}
			})
		})
	}
).catch(err => console.log(err))