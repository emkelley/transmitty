# Transmitty

Transmitty is a Node app that will split a U.S. healthcare EFT/Payment Transmittal files, separate Checks and EFTs, and zip them for later processing.

Transmitty was built to aid one of my work processes; Taking these often large 3,000+ page PDFs filled with mixed Checks and EFT payments, and processing them into a workable state for our Finance department. It was extremely tedious and time-consuming, so I automated it. If you want to use it yourself it will require some modification for your needs.


![image](https://user-images.githubusercontent.com/11874169/191545055-30efd901-2ecf-48ac-ae16-7cb0cecadced.png)


## Usage

0 - To use this utility, ensure your system has Node.js >= 16.x installed before continuing.

1 - Clone the repo and install the app's dependencies: `yarn` or `npm install`

2 - The source PDF to be processed is expected to be on the Desktop and have the word Transmittal somewhere in the file name.

3 - Run the app: `yarn start` or `npm run start` when in the app's directory.

4 - Wait for the process to complete. This can take a while depending on the size of the PDF.

5 - Final output files will be placed on the Desktop in a folder called 'Transmitty Output'. The cmd window will close and the output folder will automatically be opened.

### Tips

For quick access, create a batch file on your Desktop that moves into the project directory and runs the npm command to start it.
