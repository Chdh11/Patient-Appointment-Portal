const { BlobServiceClient } = require('@azure/storage-blob');

// Get connection string from environment variables
const connectionString = process.env.AzureWebJobsStorage;

if (!connectionString) {
    throw new Error('AzureWebJobsStorage connection string not found');
}

// Create blob service client
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Container names
const CONTAINERS = {
    MEDICAL_RECORDS: 'medical-records'
};

// Initialize containers
async function initializeContainers() {
    try {
        for (const containerName of Object.values(CONTAINERS)) {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const exists = await containerClient.exists();
            
            if (!exists) {
                await containerClient.create({
                    access: 'private' // Private access by default
                });
                console.log(`Container '${containerName}' created successfully`);
            }
        }
    } catch (error) {
        console.error('Error initializing containers:', error);
    }
}

// Helper functions
const storageHelpers = {
    // Upload file to blob storage
    async uploadFile(containerName, fileName, fileBuffer, contentType = 'application/octet-stream') {
        try {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            
            const uploadOptions = {
                blobHTTPHeaders: {
                    blobContentType: contentType
                },
                metadata: {
                    uploadedAt: new Date().toISOString()
                }
            };
            
            const uploadResponse = await blockBlobClient.upload(fileBuffer, fileBuffer.length, uploadOptions);
            
            return {
                success: true,
                fileName,
                url: blockBlobClient.url,
                uploadResponse
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Download file from blob storage
    async downloadFile(containerName, fileName) {
        try {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            
            const exists = await blockBlobClient.exists();
            if (!exists) {
                throw new Error('File not found');
            }
            
            const downloadResponse = await blockBlobClient.download();
            const properties = await blockBlobClient.getProperties();
            
            return {
                success: true,
                stream: downloadResponse.readableStreamBody,
                contentType: properties.contentType,
                contentLength: properties.contentLength,
                metadata: properties.metadata
            };
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    },

    // List files in container
    async listFiles(containerName, prefix = '') {
        try {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const files = [];
            
            for await (const blob of containerClient.listBlobsFlat({ prefix })) {
                files.push({
                    name: blob.name,
                    size: blob.properties.contentLength,
                    lastModified: blob.properties.lastModified,
                    contentType: blob.properties.contentType,
                    url: `${containerClient.url}/${blob.name}`
                });
            }
            
            return { success: true, files };
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    },

    // Delete file from blob storage
    async deleteFile(containerName, blobName) {
    try {
        console.log(`Deleting blob: ${blobName} from container: ${containerName}`);
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        // Check if blob exists before trying to delete
        const exists = await blockBlobClient.exists();
        console.log(`Blob exists: ${exists}`);
        
        if (!exists) {
            throw new Error(`Blob does not exist: ${blobName}`);
        }
        
        const deleteResult = await blockBlobClient.delete();
        console.log('Blob deleted successfully:', deleteResult);
        
        return deleteResult;
    } catch (error) {
        console.error(`Error deleting blob ${blobName}:`, error);
        throw error;
    }
},

    // Generate unique filename
    generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop();
        return `${timestamp}_${random}.${extension}`;
    }
};

module.exports = {
    blobServiceClient,
    CONTAINERS,
    initializeContainers,
    storageHelpers
};