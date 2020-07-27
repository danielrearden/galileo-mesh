### Getting started

Install dependencies

```
npm install
```

Start the server

```
npm run serve
```

### Example request

```graphql
mutation {
  postGetaccountbyid(getAccountByIdInput: {
    apiLogin: "XXX"
    apiTransKey: "XXX"
    providerId: 0000
    transactionId: "randomly_generated_uuid"
    id: "123456789"
    idType: 2
  }) {
    status
    statusCode
    echo {
      providerTimestamp
      providerTransactionId
      transactionId
    }
    systemTimestamp
    responseData {
      accounts {
        account {
          status
        }
      }
    }
  }
}
```