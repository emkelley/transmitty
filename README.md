# Transmitty

Transmitty is a Node app that will split a U.S. healthcare EFT/Payment Transmittal files, separate Checks and EFTs, and zip them for later processing.

Transmitty was built to aid one of my work processes; Taking these often large 1,000+ page PDFs filled with mixed Checks and EFT payments, and processing it into a workable state for our Finance department. It was extremely tedious and time consuming, so I automated it. If you want to use it yourself it will require some modification for your needs. Definitely not my best work but it gets the job done.

![bJPTsBeewr](https://user-images.githubusercontent.com/11874169/164364244-7f127bae-149f-4c4c-b2ec-085f681d7477.png)

## Usage

0 - To use this utility, ensure your system has Node.js >= 16.x installed before continuing.

1 - Install the app's dependencies: `yarn` or `npm install`

2 - The source PDF to be processed is expected to be on the Desktop and be named `input.pdf`

3 - Run the app: `yarn start` or `npm run start`

### Tips

For quick access, create a batch file on your Desktop that moves into the project directory and runs the npm command to start it. Something like this adapted for your use:
```bat
cd /D E:\Master Projects\transmitty
yarn start
```
