/**
 * Function to retrieve file content from OpenAI's Files API.
 *
 * @param {Object} args - Arguments for retrieving file content.
 * @param {string} args.file_id - The ID of the file to retrieve content from.
 * @returns {Promise<Object>} - The result containing the file content.
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
    const url = `${baseUrl}/v1/files/${file_id}/content`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`
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

    // Get the content as text
    const content = await response.text();
    return { content };
  } catch (error) {
    console.error('Error retrieving file content:', error);
    return { error: error.message || 'An error occurred while retrieving the file content.' };
  }
};

/**
 * Tool configuration for retrieving file content from OpenAI's Files API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'RetrieveFileContent',
      description: 'Retrieve file content from OpenAI\'s Files API.',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'The ID of the file to retrieve content from.'
          }
        },
        required: ['file_id']
      }
    }
  }
};

export { apiTool };