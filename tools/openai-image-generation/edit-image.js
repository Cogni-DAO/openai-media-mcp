/**
 * Function to edit an image using OpenAI's DALL-E API.
 *
 * @param {Object} args - Arguments for the image editing.
 * @param {string} args.image - The image to edit (base64 encoded PNG).
 * @param {string} args.prompt - The text description of the desired edit.
 * @param {string} [args.mask] - An additional image whose fully transparent areas indicate where image should be edited.
 * @param {string} [args.model="gpt-image-1"] - The model to use for image editing.
 * @param {number} [args.n=1] - Number of images to generate (1-10).
 * @param {string} [args.response_format="url"] - The format of the response ("url" or "b64_json").
 * @param {string} [args.size="1024x1024"] - The size of the generated image.
 * @param {string} [args.user] - A unique identifier representing your end-user.
 * @returns {Promise<Object>} - The result of the image editing.
 */
const executeFunction = async ({
  image,
  prompt,
  mask,
  model = 'gpt-image-1',
  n = 1,
  response_format = 'url',
  size = '1024x1024',
  user
}) => {
  const baseUrl = 'https://api.openai.com';
  const token = process.env.API_KEY;

  if (!token) {
    return { error: 'API_KEY environment variable is not set.' };
  }

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/v1/images/edits`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Prepare the form data
    const formData = new FormData();

    // Convert base64 image to blob
    const imageBlob = new Blob([Buffer.from(image, 'base64')], { type: 'image/png' });
    formData.append('image', imageBlob, 'image.png');

    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('n', n.toString());
    formData.append('response_format', response_format);
    formData.append('size', size);

    // Add mask if provided
    if (mask) {
      const maskBlob = new Blob([Buffer.from(mask, 'base64')], { type: 'image/png' });
      formData.append('mask', maskBlob, 'mask.png');
    }

    // Add user if provided
    if (user) {
      formData.append('user', user);
    }

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
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
    console.error('Error editing image:', error);
    return { error: error.message || 'An error occurred while editing the image.' };
  }
};

/**
 * Tool configuration for editing images using OpenAI's DALL-E API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'EditImage',
      description: 'Edit an image using OpenAI\'s DALL-E API.',
      parameters: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            description: 'The image to edit (base64 encoded PNG, <4MB, square).'
          },
          prompt: {
            type: 'string',
            description: 'The text description of the desired edit (max 1000 chars).'
          },
          mask: {
            type: 'string',
            description: 'An additional image whose fully transparent areas indicate where image should be edited (base64 encoded PNG, <4MB, square).'
          },
          model: {
            type: 'string',
            description: 'The model to use for image editing.',
            enum: ['dall-e-2', 'gpt-image-1'],
            default: 'gpt-image-1'
          },
          n: {
            type: 'integer',
            description: 'Number of images to generate (1-10).',
            minimum: 1,
            maximum: 10,
            default: 1
          },
          response_format: {
            type: 'string',
            description: 'The format of the response.',
            enum: ['url', 'b64_json'],
            default: 'url'
          },
          size: {
            type: 'string',
            description: 'The size of the generated image.',
            enum: ['256x256', '512x512', '1024x1024'],
            default: '1024x1024'
          },
          user: {
            type: 'string',
            description: 'A unique identifier representing your end-user.'
          }
        },
        required: ['image', 'prompt']
      }
    }
  }
};

export { apiTool };