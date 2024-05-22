import https from "https";
import { MessageText, messageButtons } from "../shared/whatsApp.modes.js";
import { config } from "../config/index.js";
import axios from "axios";
import { PromptServices } from "./prompt.service.js";

export class WtsppService extends PromptServices{
  VerifyToken = ( req, res) => {

    try {
      const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlhdCI6MTcxNjQwMzYzNCwiZXhwIjoxNzE2NDQ2ODM0fQ.KIZO2MQjACmubN-8eIsTpttjxD7mKPRVAE0t1MBn3DE";
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
  
      if (challenge != null && token != null && token == accessToken) {
        res.send(challenge);
      }else {
        res.status(400).send();
      }
      
    } catch (error) {
      res.status(400).send()
    }
  }

  ReceivedMessage = async (req, res) => {
    try {
      const entry = (req.body["entry"])[0];
      const changes = (entry["changes"])[0];
      const value = changes["value"];
      const messageObject = value["messages"]; //con esto encontramos el mesaje
  
      if (typeof messageObject != "undefined") {
        const messages = messageObject[0];
        const number = messages["from"]
        const text = this.getTextMessage(messages)

        if (text !== "") {
          console.log(text);
          console.log(number);
          await this.Process(text, 542617506693);
        }
      }
      res.send("EVENT_RECEIVED")
    } catch (error) {
      res.send("EVENT_RECEIVED")
    }
  }

  getTextMessage = (message) => {
    let text = "";
    const typeMessage = message["type"];
    if (typeMessage == "text") {
      text = (message["text"])["body"]
    } else if (typeMessage == "interactive"){
      const interactiveObject = message["interactive"];
      const typeInteractive = interactiveObject["type"];
  
      if (typeInteractive === "button_reply") {
      text = (interactiveObject["button_replay"])["title"];
      } else if (typeInteractive === "list_reply") {
        text = (interactiveObject["list_reply"])["title"];
      }else {
        console.log("sin mensajes");
      }
    } else {
      console.log("sin mensajes");
    }
    return text;
  }

  SendMessageWtspp = async (data) => {

    try {
      const url = 'https://graph.facebook.com/v19.0/321829781013280/messages  ';
      const token = 'EAAFOpYet34QBO1OVs8egxZAeMcxE6tcwv0Ut5AnZAJbBKjYy3tRKY2LQXt3hZAqAHzrlBjnKubeOAe9ODx8Y580nYNqffxiRihXl6T66ZBI9zEujpPI6MjZA8Iv7DjA1wYSDzGkoZB9zqjCXShJOa34JgMYp25ZCfZBQRif7r14hd6eHgyEQ89wG2EdSOmR3QrRLqpsyvByLpBpLqUzlIR0ZD';

      await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Mensaje enviado:', data);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error.response ? error.response.data : error.message);
    }
  }

  Process = async ( textUser, number)=> {
    textUser= textUser.toLowerCase();
    let models = [];
  
  
    //#region sin gemini
    // //Hola que tal
    // if (textUser.includes("hola")) {
    //   //SALUDAR
    //   const model = MessageText("hello, nice to me you", number);
    //   models.push(model);
    //   const listModel = MessageText("you are welcome", number);
    //   models.push(listModel);
    // } else if (textUser.includes("gracias")) {
    //   const model = MessageText("you are welcome", number);
    //   models.push(model);
    // } else if (textUser.includes("adios")) {
    //   const model = MessageText("bye bye", number);
    //   models.push(model);
    // } else if (textUser.includes("comprar")) {
    //   const model = messageButtons("Que quieres comprar?", number);
    //   models.push(model);
    // } else if (textUser.includes("vender")) {
    //   const model = MessageText("puedes vender x aca", number);
    //   models.push(model);
    // } else {
    //   const model =  MessageText("I do not know", number);
    //   models.push(model);
    // }
    // #endregion
  
    // #region con gemini
    try { 
      let data = await this.getAll();

      const dataPrev = data.map(item => {
        const {_id, ...Data } = item; 
        return Data._doc.Data;
      });
      const dataString = JSON.stringify(dataPrev);
      const response = await this.geminiGeneration(textUser, dataString, "prueva whatsapp");
        if (response !== null) {
          const model = MessageText(response, number);
          models.push(model)
        } else {
          const model = wtsppModels.MessageText("Lo siento algo salio mal intesta mas tarde", number);
          models.push(model)
        }
        models.forEach(model => {
          this.SendMessageWtspp(model);
          console.log({model});
        })
      } catch (error) {
        console.error(error);
      }
    }
    
  }
  // #endregion
