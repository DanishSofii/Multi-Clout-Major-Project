class StoragePool {
    constructor(totalSize) {
        this.totalSize = totalSize;
        this.providers = new Map();
        this.usedSpace = 0;
    }

    addProvider(providerId, provider, allocatedSize) {
        if (this.usedSpace + allocatedSize > this.totalSize) {
            throw new Error('Exceeding total storage pool size');
        }
        this.providers.set(providerId, {
            provider,
            allocatedSize,
            usedSpace: 0
        });
        this.usedSpace += allocatedSize;
    }

    removeProvider(providerId) {
        const provider = this.providers.get(providerId);
        if (provider) {
            this.usedSpace -= provider.allocatedSize;
            this.providers.delete(providerId);
        }
    }

    async uploadFile(filePath, fileName) {
        for (const [providerId, providerData] of this.providers) {
            try {
                const fileId = await providerData.provider.uploadFile(filePath, fileName);
                return { providerId, fileId };
            } catch (error) {
                console.error(`Failed to upload to provider ${providerId}:`, error);
                continue;
            }
        }
        throw new Error('Failed to upload file to any provider');
    }

    async downloadFile(fileId, providerId) {
        const providerData = this.providers.get(providerId);
        if (!providerData) {
            throw new Error('Provider not found');
        }
        return providerData.provider.downloadFile(fileId);
    }

    async deleteFile(fileId, providerId) {
        const providerData = this.providers.get(providerId);
        if (!providerData) {
            throw new Error('Provider not found');
        }
        await providerData.provider.deleteFile(fileId);
    }
}

module.exports = StoragePool;