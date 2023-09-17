## Function
Takes in an Excel Sheet of MC records as input and automates the process of sending reminder Whatsapp messages to them.

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
