## Function
Takes in an Excel Sheet of MC records and automates the process of sending reminder Whatsapp messages to individuals who have yet to submit their MC.

The excel sheet requires columns corresponding to the following:
- Rank
- Name
- HP Number (8 digits)
- MC Type ("MC" or "HL")
- MC from a SAF Medical Centre? ("Yes" or "No")
- MC Start Date (dd/mm/yy)
- MC End Date (dd/mm/yy)
- Submitted MC? ("Yes" or "")

These column header names can be configured in Settings > Column Headers

## Usage

### Install Dependencies

```
$ npm install
```

### Use it

```
# development mode
$ npm run dev

# production build
$ npm run build:win64 (or npm run build:linux)
```

### Logging
In production, error logs are stored in "%USERPROFILE%\AppData\Roaming\MC Reminder Sender\logs\main.log"