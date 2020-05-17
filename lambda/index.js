
// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
//getting data from languageStrings
const languageStrings = require('./languageStrings');
//launchpage json
const launchDocument = require('./documents/launchDocument.json');
//randomholiday json with button
const randomDocument = require('./documents/randomDocument.json');
const util = require('./util');


//launch page--home(welcome) page
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);
        //debug--Logs : Amazon CloudWatch
        //console.log(data);
        let speakOutput = " ";
        const prompt = data["QUESTION"];
        speakOutput = data["WELCOME_MESSAGE"] + data["QUESTION"];
        
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                // Create Render Directive
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: launchDocument,
                    datasources: {
                        text: {
                            "start": "Welcome to Random Holiday " 
                        },
                        images: {
                            "cityPic":"https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/welcome+page.jpg",
                            "backgroundURL": "https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png",
                            "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
                        }
                    }
                });
        }  
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(prompt)
            .getResponse();
    }
};

//globalization 
function getLocalizedData(locale){
    return languageStrings[locale];
}

//fecth API-HTTP calls, input: lat and lon, output: weather information
var http = require('http');
function weather(latitude, longitude){
    return new Promise((resolve, reject)=>{
        const url = 'http://api.weatherstack.com/current?access_key=&query=' + latitude + ',' + longitude
    
        const request = http.request(url, (response)=>{
            let data = ''
        
            response.on ('data', (chunk) =>{
                data = data + chunk.toString()
            })
        
            response.on ('end', () =>{
                resolve(JSON.parse(data));
            })
        })
        
        request.on('error',(error)=>{
            reject(error);
        })
        
        request.end()
    });
}

// fecth API-HTTP calls, input: city name, output: lat and lon
var https = require('https');
function geoLocation(address){
    return new Promise((resolve, reject)=>{
        const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + '.json?access_token='
    
        const request = https.request(url, (response)=>{
            let data = ''
        
            response.on ('data', (chunk) =>{
                data = data + chunk.toString()
            })
        
            response.on ('end', () =>{
                resolve(JSON.parse(data));
            })
        })
        
        request.on('error',(error)=>{
            reject(error);
        })
        
        request.end()
    });
}

// main functionality for giving back random city information 
const RandomDestIntentHandler = {
  canHandle(handlerInput) {
        //add an AMAZON.YesIntent , attention to the caps!
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomDestIntent') 
            ||(Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent');
    },
   
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    
    //location is array of object, get from data.js
    //randomLocation is one object, random pick from the location array
    let randomLocation;
    const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);
    const location = data["LOCATION"];
    //console.log(location);
    
    
      // If an array is used then a random value is selected
      if (Array.isArray(location)) {
        randomLocation = location[Math.floor(Math.random() * location.length)];
      }
      
    //geoLocationresponse get the randomLocation's lat and lon!
    const geoLocationresponse = await geoLocation(randomLocation.text);
   // console.log(geoLocationresponse);
    const lat = geoLocationresponse.features[0].center[1];
    const lon = geoLocationresponse.features[0].center[0];
    //get weather information from weather http API request, using the lat/lon result from geoLocation
    const response = await weather(lat, lon);
    //response.current.weather_descriptions[0] = weatherInfor is the current weather information
    //console.log(response.current.weather_descriptions[0]);
    const weatherInfor = response.current.weather_descriptions[0];
    console.log(weatherInfor);
    
    const speakOutput = data["MESSAGE"] + randomLocation.text;

    
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: randomDocument,
                datasources: {
                    text: {
                        "start": randomLocation.text + weatherInfor
                    },
                    images: {
                        "cityPic":randomLocation.image,
                        "backgroundURL": "https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png",
                        "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
                    }
                }
            });
    }              
    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      //.withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

//handle the button Click event go back to launch page
const ReturnButtonEventHandler = {
    canHandle(handlerInput){
        // Since an APL skill might have multiple buttons that generate UserEvents,
        // use the event source ID to determine the button press that triggered
        // this event and use the correct handler. In this example, the string 
        // 'returnButton' is the ID we set on the AlexaButton in the document.
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
            && handlerInput.requestEnvelope.request.source.id === 'returnButton';
    },
    handle(handlerInput){
        const speakOutput = "Thank you for clicking the button! Do you want to ask me for a random holiday destination?";
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                // Create Render Directive
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: launchDocument,
                    datasources: {
                        text: {
                            "start": "Welcome to Random Holiday " 
                        },
                        images: {
                            "cityPic":"https://elasticbeanstalk-us-east-1-754237753286.s3.amazonaws.com/welcome+page.jpg",
                            "backgroundURL": "https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png",
                            "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
                        }
                    }
                });
        }  
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(prompt)
            .getResponse();
    }
}


const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

//didn't use here 
const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RandomDestIntentHandler,
    ReturnButtonEventHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();
