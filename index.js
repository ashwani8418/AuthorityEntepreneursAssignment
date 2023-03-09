console.log("Hello World");


const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IkpOVEpTV04ya0tkRVZkMElFbEZhIiwiY29tcGFueV9pZCI6ImJmb1Q3MkNWcm9oMlg4ZWZPUmdRIiwidmVyc2lvbiI6MSwiaWF0IjoxNjYxNDE2NzQzNTcxLCJzdWIiOiJQcVJEWDZqMjdXempXRUNsQm92eCJ9.u6WPtyudfB9R4nLnLbBZ6i9KquDeK6WnIOZxKAeE9Hg';

const request = require('postman-request');

const getCustomFieldId = async (apiKey) => {
  const options = {
    method: 'GET',
    url: 'https://rest.gohighlevel.com/v1/custom-fields/',
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  };

  const response = await new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) reject(error);
      resolve(response);
    });
  });

  const data = JSON.parse(response.body);
  const customField = data.customFields.find(field => field.name === 'DFS Booking Zoom Link');

  if (!customField) throw new Error('Failed to retrieve custom field ID');

  console.log(`Custom field ID: ${customField.id} name : ${customField.name}`);


  return customField.id;
};

const getMatchingContact = async (apiKey, customFieldID) => {
  const options = {
    method: 'GET',
    url: 'https://rest.gohighlevel.com/v1/contacts',
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  };

  const response = await new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) reject(error);
      resolve(response);
    });
  });

  const data = JSON.parse(response.body);

  const matchingContact = data.contacts.find(contact =>
    contact.customField.some(field =>
      field.id === customFieldID && field.value === 'DFS Booking Zoom Link'
    )
  );

  if (!matchingContact) throw new Error('No matching contact found');

  console.log(`Matching contact ID: ${matchingContact.id}`);

  return matchingContact;
};

const updateCustomFieldValue = async (apiKey, customFieldID) => {
  const matchingContact = await getMatchingContact(apiKey, customFieldID);
  const email = matchingContact.email;
  const phone = matchingContact.email;
  const options = {
    method: 'PUT',
    url: `https://rest.gohighlevel.com/v1/contacts/${matchingContact.id}`,
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    // body: JSON.stringify({
    //   email: email,
    //   phone: phone,
    //   customField: [{
    //     id: customFieldID,
    //     value: 'TEST'
    //   }]
    // })

    body: `{\n "email":${email} ,\n    "phone":${phone},"customField": {\n        "__custom_field_id__": ${customFieldID}, \n "value" ${"TEst"}  }\n}`

  };

  const response = await new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) reject(error);
      resolve(response);
    });
  });

 
};



(async () => {
  try {
    const customFieldID = await getCustomFieldId(apiKey);
    await updateCustomFieldValue(apiKey, customFieldID);
    console.log("Successfully Updated")
  } catch (error) {
    console.error(error);
  }
})();

