/**
 * Function to delete a file from OpenAI's Files API.
 *
 * @param {Object} args - Arguments for deleting a file.
 * @param {string} args.file_id - The ID of the file to delete.
 * @returns {Promise<Object>} - The result of the file deletion.
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
      method: 'DELETE',
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
    console.error('Error deleting file:', error);
    return { error: error.message || 'An error occurred while deleting the file.' };
  }
};

/**
 * Tool configuration for deleting files from OpenAI's Files API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'DeleteFile',
      description: 'Delete a file from OpenAI\'s Files API.',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'The ID of the file to delete.'
          }
        },
        required: ['file_id']
      }
    }
  }
};

export { apiTool };