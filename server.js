//server.js

//Initialize dependencies
var express			= require('express'),
	app        		= express(),
	bodyParser 		= require('body-parser'),
	Allocation 		= require('./models/allocation'),
	async			= require('async'),
	Table 			= require('./models/table'),
	Import 			= require('./models/import')

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({limit: '1gb', extended: true }))

var port = process.env.PORT || 5000

//Setup oauth2
var oauth2 = require('simple-oauth2'),
	credentials = {
        clientID: '3MVG9uudbyLbNPZMn2emQiwwmoqmcudnURvLui8uICaepT6Egs.LFsHRMAnD00FSog.OXsLKpODzE.jxi.Ffu',
        clientSecret: '625133588109438640',
        site: 'https://login.salesforce.com',
        authorizationPath: '/services/oauth2/authorize',
        tokenPath: '/services/oauth2/token',
        revokePath: '/services/oauth2/revoke'
    }

//Initialize the OAuth2 Library
var oauth2 = oauth2(credentials)

//Setup routes for API
var router = express.Router()

//database
var pg = require('pg')
pg.defaults.ssl = true

router.route('/:instance/allocation/:accessToken')
	.get(function(req,res){
		allocation = new Allocation(req.params.instance, req.params.accessToken)
		allocation.getAllocation(oauth2,function(result){
			console.log('should be returning json')
			res.json(result)
		})
	})

router.route('/:instance/pipline/:accessToken/00Oa00000093sBK')
	.get(function(req, res) {
		pipeline = new Pipeline(oauth2, function(result) {
			res.json(result)
		})
	})

router.route('/exportFromSheets')
	.post(function(req,res){
		//console.log(req.body)
		table = new Table(req.body)
		pg.connect(process.env.DATABASE_URL, function(err, client) {
			if (err) throw err;
			table.saveTable(client,function(err){
				if (err)
					res.send(err)
				res.json({message: 'Success!'})
				//client.end();
			})
		})
	})


router.route('/importToSheets/:sheetName')
	.get(function(req, res){
		importFile = new Import(req.params.sheetName)
		pg.connect(process.env.DATABASE_URL, function(err, client) {
			if (err) throw err;
			importFile.getJsonData(client, function(err, result){
				if (err)
					res.send(err)
				res.json(result)
				client.end()
			})
		})		
	})

router.route('/displayOptions')
	.get(function(req, res) {
		//input irrelevant to query
		importFile = new Import('foo')
		pg.connect(process.env.DATABASE_URL, function(err, client) {
			if (err) throw err;
			importFile.displayOptions(client, function(err, result){
				if (err)
					res.send(err)
				res.json(result)
				client.end()
			})
		})		
	})

//Register routes
//All of our routes will be prefixed with /api
app.use('/api', router)

//Start server
app.listen(port);
console.log('Magic happens on port ' + port)
