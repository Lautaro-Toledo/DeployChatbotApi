import https from "https";
import { MessageText, messageButtons } from "../shared/whatsApp.modes.js";
import { config } from "../config/index.js";

export class WtsppService {
  VerifyToken = ( req, res) => {

    try {
      const accessToken = "Z9ES8DXF7CG6V5JHBKN";
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
          await Process(text, number);
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

  SendMessageWtspp = (data) => {

    const options = {    
      host: "graph.facebook.com",
      path: "v19.0/321829781013280/messages",
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer EAAFOpYet34QBOyrSWjGzYE5kpt234ms9fqr8zlvJxWn9dPcBuQKgpjdzbTRnHMi76DgFCFsNiQSA7kduvaN3gEWHPZBwj80EC5fnZBDnvWua3C1UFD6aG0GfFOjoZAtBIm5TsTF4E6ZBknu9Sh2KuQzDSAjXN9jHbQqCw0SVH6kZBCCMCM1z77JCsOMur1XaCyK8mN8IbnElkf7iGLVIZD"
      }
    };
  
    const req = https.request(options, res => {
      res.on("data", d=> {
        process.stdout.write(d);
      })
    });
  
    req.on("error", err => {
      console.error(err);
    }) 
  
    req.write(data);
    req.end();
  }

  Process = async (textUser, number)=> {
    textUser= textUser.toLowerCase();
    let models = [];
  
  
    //#region sin gemini
    //Hola que tal
    if (textUser.includes("hola")) {
      //SALUDAR
      const model = MessageText("hello, nice to me you", number);
      models.push(model);
      const listModel = MessageText("you are welcome", number);
      models.push(listModel);
    } else if (textUser.includes("gracias")) {
      const model = MessageText("you are welcome", number);
      models.push(model);
    } else if (textUser.includes("adios")) {
      const model = MessageText("bye bye", number);
      models.push(model);
    } else if (textUser.includes("comprar")) {
      const model = messageButtons("Que quieres comprar?", number);
      models.push(model);
    } else if (textUser.includes("vender")) {
      const model = MessageText("puedes vender x aca", number);
      models.push(model);
    } else {
      const model =  MessageText("I do not know", number);
      models.push(model);
    }
    // #endregion
  
    //#region con gemini
    // const responseChatGPT = await chatGPTServices.GetMessageChatGPT(textUser)
    // if (responseChatGPT !== null) {
    //   const model = MessageText(responseChatGPT, number);
    //   models.push(model)
    // } else {
    //   const model = wtsppModels.MessageText("Lo siento algo salio mal intesta mas tarde", number);
    //   models.push(model)
    // }
    
    // #endregion
    
  
    models.forEach(model => {
      this.SendMessageWtspp(model);
    })
  }
  
}
