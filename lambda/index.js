
// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
//different languages
const languageStrings = require('./languageStrings');
const launchDocument = require('./documents/launchDocument.json');
const util = require('./util');
//get dataSource, import data.js geting all the location data here
//const data = require ('./data');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);
        //debug--Logs : Amazon CloudWatch
        console.log(data);
        //const speakOutput = 'Welcome, to Riddle Me Today. I will give youa Riddle everyday and 3 chances to answer it correctly. The Less chances you take, the more points you win.';
        //best practice due, when client didn't response, we can have reprompt to ask again
        //const prompt = 'Are you ready for today\'s riddle?';
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
        /*
        let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        console.log(persistentAttributes.FIRST_TIME);
        
        if (persistentAttributes.FIRST_TIME === undefined){
            //first time user
            const dataToSave = {
                "FIRST_TIME":false
            }
            speakOutput = data["WELCOME_MESSAGE"] + data["QUESTION"];
            const attributesManager = handlerInput.attributesManager;
            //set attributes
            attributesManager.setPersistentAttributes(dataToSave);
            //finally save the attributes
            await attributesManager.savePersistentAttributes();
        } else {
            //not first time user
            speakOutput = data["REYURNING_USERS_WELCOME"] + data["QUESTION"];
        }
        */
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


// core functionality for fact skill
const RandomDestIntentHandler = {
  canHandle(handlerInput) {
        //we add an AMAZON.YesIntent , attention to the caps!
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomDestIntent') 
            ||(Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent');
    },
    /*
      canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        // checks request type
        return request.type === 'LaunchRequest'
          || (request.type === 'IntentRequest'
            && request.intent.name === 'RandomDestIntent');
      },
  */
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    // const randomFact = requestAttributes.t('FACTS');
    
    //location is array of object, get from data.js
    //randomLocation is one object, random pick from the location array
    let randomLocation;
    const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);
    const location = data["LOCATION"];
    console.log(location);
    
      // If an array is used then a random value is selected
      if (Array.isArray(location)) {
        randomLocation = location[Math.floor(Math.random() * location.length)];
      }
    
    // concatenates a standard message with the random fact
    // requestAttributes.t is geeting the title translation from languageStrings.js, part of i18next library

    const speakOutput = data["MESSAGE"] + randomLocation.text;
    
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: launchDocument,
                datasources: {
                    text: {
                        "start": "Holiday Destination: " +  randomLocation.text
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
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();
