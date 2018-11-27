'use strict'

const prettyjson = require('prettyjson');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const access_token = "EAAD39wZC2ZAl8BAJcMTPix4XEQMq6UHXxTAkAf0WV0KuD8n3uUgXmeLzxzUSVPUo4shKOHyqIKwhlGmwF3MpBionDvDSvAxjNVkbDmXPUCw26nOkHsVurKCyRAwnR7CawPseC7IXcaDEZBFnbzceEvILGrhfmqpjg3Hx1qyTQZDZD"
const verify_token_fb = 'pugpizza_token'

// const access_token = "token creado en fb developer"
// const verify_token_fb = 'cualquier nombre al token'

const app = express()

// app.set('port', 5000)
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.json())

app.get('/', function(req, response) {
  response.send('Hola mundo')
})

app.get('/webhook', function (req, response) {
  if (req.query['hub.verify_token']=== verify_token_fb) {
    response.send(req.query['hub.challenge'])
  } else {
    response.send('Pug pizza no tienes permisos')
  }
})

app.post('/webhook/', function(req, res){
  const webhook_event = req.body.entry[0]
  if (webhook_event.messaging) {
    webhook_event.messaging.forEach(event => {
      handleEvent(event.sender.id, event)
    })
  }   
  res.sendStatus(200)
})

function handleEvent(senderId, event) {
  if (event.message) {
    // handleMessage(senderId, event.message)
    if (event.message.quick_reply) {
      handlePostBack(senderId, event.message.quick_reply.payload)
    } else {
      handleMessage(senderId, event.message)
    }
  } else if (event.postback) {
    handlePostBack(senderId, event.postback.payload)
  } 
}

function handleMessage(senderId, event) {
  if (event.text) {
    // defaultMessage(senderId)
    // contactSupport(senderId)
    // showLocations(senderId)
    //receipt(senderId)
    getLocation(senderId)
  } else if (event.attachments) {
    handleAttachments(senderId, event)
  }
}

function defaultMessage(senderId) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "text": "Hola soy un bot de messenger y te invito a utilizar nuestro menu",
      "quick_replies": [
        {
            "content_type": "text",
            "title": "¿Quieres una Pizza?",
            "payload": "PIZZAS_PAYLOAD"
        },
        {
            "content_type": "text",
            "title": "Contacta Soporte",
            "payload": "ABOUT_PAYLOAD"
        }
      ]
    }
  }
  senderActions(senderId)
  callSendApi(messageData)
}

function handlePostBack(senderId, payload) {
  console.log(payload)
  switch (payload) {
    case "GET_STARTED_PUGPIZZA":
      defaultMessage(senderId)
    break;
  
    case "ABOUT_PAYLOAD":
      contactSupport(senderId)
    break;

    case "PIZZAS_PAYLOAD":
        showPizzas(senderId)
    break;

    case "PEPPERONI_PAYLOAD":
        sizePizza(senderId)
    break;

    case "PERSONAL_SIZE_PAYLOAD":
        receipt(senderId)
    break;

    case "LOCATIONS_PAYLOAD":
    showLocations(senderId)
    break;

    case "CONTACT_PAYLOAD":
    contactSupport(senderId)
    break;
  }
}

function senderActions(senderId) {
  const messageData = {
      "recipient": {
          "id": senderId
      },
      "sender_action": "mark_seen"
  }
  callSendApi(messageData);
}

function handleAttachments(senderId, event) {
  let attachment_type = event.attachments[0].type
  switch (attachment_type) {
    case "image" :
            console.log(attachment_type)
        break;
    case "video":
            console.log(attachment_type)
    break;
    case "audio":
            console.log(attachment_type);
    break;
    case "file":
            console.log(attachment_type);
    break;
    case "location":
            console.log(prettyjson.render(event));
    break;
  }
}

function callSendApi(response) {
  request({
    "uri": "https://graph.facebook.com/me/messages",
    "qs":{
      "access_token": access_token
    },
    "method": "POST",
    "json": response
  },
  function(err) {
    if (err) {
      console.log('Ha ocurrido un error');
    } else {
      console.log("Mensaje enviado");
    }
  })
}

function showPizzas(senderId) {
  const messageData = {
    "recipient": {
      "id": senderId
  },
    "message": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title" : "Peperoni",
              "subtitle": "Con todo el sabor del peperoni",
              "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir Pepperoni",
                  "payload": "PEPPERONI_PAYLOAD"
                }
              ]
            },
            {
              "title" : "Pollo BBQ",
              "subtitle": "Con todo el sabor del BBQ",
              "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir BBQ",
                  "payload": "BBQ_PAYLOAD"
                }
              ]
            }
          ]
        }
      }
    }
  }
  callSendApi(messageData)
}

function messageImage(senderId) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "attachment": {
        "type": "image",
        "payload": {
          "url": "https://media.giphy.com/media/1dOIvm5ynwYolB2Xlh/giphy.gif"
        }
      }
    }
  }
  callSendApi(messageData)
}

function contactSupport(senderId) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Hola este es el canal de soporte, quieres llamarnos?",
          "buttons": [
            {
              "type": "phone_number",
              "title": "Llamar a un asesor",
              "payload": "+527223228383"
            }
          ]
        }
      }
    }
  }
  callSendApi(messageData)
}

function showLocations(senderId) {
  const messageData = {
    "recipient": {
        "id": senderId
    },
      "message": {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "list",
            "top_element_style": "large",
            "elements": [
                {
                  "title": "Sucursal Mexico",
                  "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                  "subtitle": "Direccion bonita #555",
                  "buttons": [
                      {
                        "title": "Ver en el mapa",
                        "type": "web_url",
                        "url": "https://goo.gl/maps/GCCpWmZep1t",
                        "webview_height_ratio": "full"
                      }
                    ]
                  },
                  {
                    "title": "Sucursal Colombia",
                    "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                    "subtitle": "Direccion muy lejana #333",
                    "buttons": [
                        {
                          "title": "Ver en el mapa",
                          "type": "web_url",
                          "url": "https://goo.gl/maps/GCCpWmZep1t",
                          "webview_height_ratio": "tall"
                        }
                      ]
                  }
              ]
          }
        }
      }
    }
  callSendApi(messageData);
}

function sizePizza(senderId) {
  const messageData = {
    "recipient": {
      "id": senderId
  },
    "message": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style": "large",
          "elements": [
            {
              "title": "Individual",
              "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              "subtitle": "Porcion individual de pizza",
              "buttons": [
                  {
                      "type": "postback",
                      "title": "Elegir Individual",
                      "payload": "PERSONAL_SIZE_PAYLOAD",
                  }
              ]
            },
          {
            "title": "Mediana",
            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
            "subtitle": "Porcion Mediana de pizza",
            "buttons": [
                {
                    "type": "postback",
                    "title": "Elegir Mediana",
                    "payload": "MEDIUM_SIZE_PAYLOAD",
                }
            ]
          }
          ]
        }
      }
    }
  }
  callSendApi(messageData)
}

function receipt(senderId) {
  const messageData = {
      "recipient": {
          "id": senderId
      },
      "message": {
          "attachment": {
              "type": "template",
              "payload": {
                  "template_type": "receipt",
                  "recipient_name": "Alexis Araujo",
                  "order_number": "123123",
                  "currency": "MXN",
                  "payment_method": "Efectivo",
                  "order_url": "https://platzi.com/order/123",
                  "timestamp": "123123123",
                  "address": {
                      "street_1": "Casa Alexis",
                      "street_2": "---",
                      "city": "Mexico",
                      "postal_code": "543135",
                      "state": "Mexico",
                      "country": "Mexico"
                  },
                  "summary": {
                      "subtotal": 12.00,
                      "shipping_cost": 2.00,
                      "total_tax": 1.00,
                      "total_cost": 15.00
                  },
                  "adjustments": [
                      {
                          "name": "Descuento frecuent",
                          "amount": 1.00
                      }
                  ],
                  "elements": [
                      {
                          "title": "Pizza Pepperoni",
                          "subtitle": "La mejor pizza de pepperoni",
                          "quantity": 1,
                          "price": 10,
                          "currency": "MXN",
                          "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
                      },
                      {
                          "title": "Bebida",
                          "subtitle": "Jugo de Tamarindo",
                          "quantity": 1,
                          "price": 2,
                          "currency": "MXN",
                          "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
                      }
                  ]
              }
          }
      }
  }
  callSendApi(messageData);
}

function getLocation(senderId) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "text": "Ahora ¿Puedes proporcionarnos tu ubicacion?",
      "quick_replies": [
        {
          "content_type": "location"
        }
      ]
    }
  }
  callSendApi(messageData)
}

app.listen(app.get('port'), function () {
  console.log('Nuestro servidor esta funcionando en el puerto', app.get('port'));
  
})