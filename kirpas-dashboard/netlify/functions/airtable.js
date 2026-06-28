exports.handler = async function(event) {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = 'appUzLXVLzKCRpM28';
  const CONTACTS_TABLE = 'tbloDKOcw080qCBPx';
  const CLIENTS_TABLE = 'tblA71hI9iXZJ2E72';

  const { business_id } = event.queryStringParameters || {};

  if (!business_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing business_id' }) };
  }

  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const clientRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${CLIENTS_TABLE}/${business_id}`,
      { headers }
    );
    if (!clientRes.ok) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }
    const client = await clientRes.json();

    const formula = encodeURIComponent(`SEARCH("${business_id}", ARRAYJOIN({Business}))`);
    const contactsRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${CONTACTS_TABLE}?filterByFormula=${formula}&pageSize=100`,
      { headers }
    );
    const contactsData = await contactsRes.json();
    const contacts = contactsData.records || [];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ client: client.fields, contacts })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
