import inquirer from "inquirer";
import qr from "qr-image";
import fs from "fs";

inquirer
  .prompt([
    {
        message: "Enter url:",//user enter the url in the terminal
        name: "URL", //the url entered by the user gets saved in URL!!
    },
    
    
  ])
  .then((answers) => {
    const url = answers.URL;
    var qr_svg = qr.image(url);     //converts the entered url to image stream
    qr_svg.pipe(fs.createWriteStream('qr_img.png')); //sends the image to new image file

    fs.writeFile("qr_code.txt", url, (err) => {  //writes the user input to new text file
        if (err) throw err;
        console.log("The file has been saved!!");
    })

  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });