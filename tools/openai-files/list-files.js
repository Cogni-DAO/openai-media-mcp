/**
 * Function to list files from OpenAI's Files API.
 *
 * @param {Object} args - Arguments for listing files.
 * @param {string} [args.purpose] - Filter files by purpose.
 * @param {number} [args.limit] - Limit the number of files returned (max 10000).
 * @param {string} [args.after] - Return files after this file ID for pagination.
 * @param {string} [args.before] - Return files before this file ID for pagination.
 * @returns {Promise<Object>} - The result containing the list of files.
 */
const executeFunction = async ({
  purpose,
  limit = 20,
  after,
  before
}) => {
  const baseUrl = 'https://api.openai.com';
  const token = process.env.API_KEY;

  if (!token) {
    return { error: 'API_KEY environment variable is not set.' };
  }

  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/v1/files`);
    
    if (purpose) url.searchParams.append('purpose', purpose);
    if (limit) url.searchParams.append('limit', limit.toString());
    if (after) url.searchParams.append('after', after);
    if (before) url.searchParams.append('before', before);

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
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
    console.error('Error listing files:', error);
    return { error: error.message || 'An error occurred while listing files.' };
  }
};

/**
 * Tool configuration for listing files from OpenAI's Files API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'ListFiles',
      description: 'List files from OpenAI\'s Files API.',
      parameters: {
        type: 'object',
        properties: {
          purpose: {
            type: 'string',
            description: 'Filter files by purpose.',
            enum: ['assistants', 'fine-tune', 'batch']
          },
          limit: {
            type: 'integer',
            description: 'Limit the number of files returned (max 10000).',
            minimum: 1,
            maximum: 10000,
            default: 20
          },
          after: {
            type: 'string',
            description: 'Return files after this file ID for pagination.'
          },
          before: {
            type: 'string',
            description: 'Return files before this file ID for pagination.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };