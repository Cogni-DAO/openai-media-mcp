/**
 * Function to retrieve file information from OpenAI's Files API.
 *
 * @param {Object} args - Arguments for retrieving file information.
 * @param {string} args.file_id - The ID of the file to retrieve.
 * @returns {Promise<Object>} - The result containing the file information.
 */
const executeFunction = async ({
  file_id
}) => {
  const baseUrl = 'https://api.openai.com';
  const token = process.env.API_KEY;

  if (!token) {
    return { error: 'API_KEY environment variable is not set.' };
  }

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/v1/files/${file_id}`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        // Response wasn't JSON, use the HTTP status message
      }
      throw new Error(errorMessage);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving file:', error);
    return { error: error.message || 'An error occurred while retrieving the file.' };
  }
};

/**
 * Tool configuration for retrieving file information from OpenAI's Files API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'RetrieveFile',
      description: 'Retrieve file information from OpenAI\'s Files API.',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'The ID of the file to retrieve.'
          }
        },
        required: ['file_id']
      }
    }
  }
};

export { apiTool };