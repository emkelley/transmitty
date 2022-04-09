# Transmitty

Transmitty is a Node app that will split a U.S. healthcare EFT/Payment Transmittal files, separate Checks and EFTs, and zip them for later processing.

Transmitty was built to aid one of my work processes; Taking these often large 1,000+ page PDFs filled with mixed Checks and EFT payments, and processing it into a workable state for our Finance department. It was a extremely tedious and time consuming, so I automated it. If you want to use it yourself it will require some modification for your needs. Definitely not my best work but it gets the job done.


## Usage

1 - To use this utility, ensure your system has Node.js >= 16.x installed before continuing.

2 - Install the app's dependencies: `yarn` or `npm install`

3 - Run the app: `yarn start` or `npm run start`


### Tips

The source PDF to be processed is expected to be in the same directory as the app in the `seed` folder and named `seed.pdf`. In the future I plan to add a UI to allow for the user to select the file. Maybe something with Tauri? Electron?