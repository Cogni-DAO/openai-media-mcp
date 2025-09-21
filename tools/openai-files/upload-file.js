/**
 * Function to upload a file to OpenAI's Files API.
 *
 * @param {Object} args - Arguments for the file upload.
 * @param {string} args.file_path - The path to the file to upload.
 * @param {string} args.purpose - The purpose of the uploaded file (e.g., "fine-tune", "assistants").
 * @returns {Promise<Object>} - The result of the file upload.
 */
const executeFunction = async ({
  file_path,
  purpose = 'assistants'
}) => {
  const baseUrl = 'https://api.openai.com';
  const token = process.env.API_KEY;

  if (!token) {
    return { error: 'API_KEY environment variable is not set.' };
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');

    // Check if file exists
    if (!fs.existsSync(file_path)) {
      return { error: `File not found: ${file_path}` };
    }

    // Create form data
    const form = new FormData();
    const fileStream = fs.createReadStream(file_path);
    const fileName = path.basename(file_path);
    
    form.append('file', fileStream, fileName);
    form.append('purpose', purpose);

    // Construct the URL for the request
    const url = `${baseUrl}/v1/files`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: form
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
    console.error('Error uploading file:', error);
    return { error: error.message || 'An error occurred while uploading the file.' };
  }
};

/**
 * Tool configuration for uploading files to OpenAI's Files API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'UploadFile',
      description: 'Upload a file to OpenAI\'s Files API.',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'The path to the file to upload.'
          },
          purpose: {
            type: 'string',
            description: 'The purpose of the uploaded file.',
            enum: ['assistants', 'fine-tune', 'batch'],
            default: 'assistants'
          }
        },
        required: ['file_path']
      }
    }
  }
};

export { apiTool };