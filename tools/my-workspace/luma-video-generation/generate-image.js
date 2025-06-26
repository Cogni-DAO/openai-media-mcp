/**
 * Function to generate an image using the Luma Video Generation API.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.prompt - The prompt for generating the image.
 * @param {string} [args.model="photon-flash-1"] - The model to use for image generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated image.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({ prompt, model = 'photon-flash-1', aspect_ratio = '16:9' }) => {
  const baseUrl = processss.env.BASE_URL;
  const token = process.env.MY_WORKSPACE_API_KEY;
  try {
    // Construct the URL for the request
    const url = `${baseUrl}/dream-machine/v1/generations/image`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Prepare the request body
    const body = JSON.stringify({
      prompt,
      model,
      aspect_ratio
    });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating image:', error);
    return { error: 'An error occurred while generating the image.' };
  }
};

/**
 * Tool configuration for generating images using the Luma Video Generation API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'GenerateImage',
      description: 'Generate an image using the Luma Video Generation API.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The prompt for generating the image.'
          },
          model: {
            type: 'string',
            description: 'The model to use for image generation.'
          },
          aspect_ratio: {
            type: 'string',
            description: 'The aspect ratio of the generated image.'
          }
        },
        required: ['prompt']
      }
    }
  }
};

export { apiTool };