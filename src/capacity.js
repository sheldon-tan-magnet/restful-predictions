//*************************************
/**
* @module Capacity
* @desc The Capacity module contains function(s) to perform SOQL queries via the 
node-salesforce library to return current capacity data to Google Sheets.
*/
//*************************************

/**
* @function queryCapacity
* @desc Query salesforce to obtain role, name, and utilization.
* @param {string} accessToken - oauth2 access token
* @param {string} path - path to SF server
* @param callback - callback to handle capacity data
*/
function queryCapacity(accessToken, path, callback) {
	var sf = require('node-salesforce')
	var moment = require('moment')
	var async = require('async')
	// Set up the sheet headers
	var capacityData = [[
			'ROLE',
			'NAME',
			'UTILIZATION_TARGET'
		]]

	// Connect to SF
	var conn = new sf.Connection({
	  instanceUrl: "https://" + path,
	  accessToken: accessToken
	})

	// Execute SOQL query to populate capacityData
	conn.query("SELECT pse__Resource_Role__c, Name, pse__Utilization_Target__c FROM Contact WHERE pse__Resource_Role__c!='' AND pse__Utilization_Target__c>=0 ORDER BY pse__Resource_Role__c")
  	.on("record", function onRecordCallback(record) {
  		var recordData = []
    	recordData.push(
    		record.pse__Resource_Role__c,
			record.Name,
			record.pse__Utilization_Target__c/100
		)
    	capacityData.push(recordData)
		})
	.on("end", function onEndCallback(query) {
		console.log("total in database : " + query.totalSize);
		console.log("total fetched : " + query.totalFetched);
		callback(capacityData)
		})
	.on("error", function onErrorCallback(err) {
		callback(err)
		})
	.run({ autoFetch : true, maxFetch : 8000 });
}

module.exports.queryCapacity = queryCapacity
//*************************************





