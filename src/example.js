const GoogleDriveProvider = require('./providers/GoogleDriveProvider');
const StoragePool = require('./models/StoragePool');
const LogicalVolume = require('./models/LogicalVolume');

async function main() {
    // Create Google Drive providers
    const drive1 = new GoogleDriveProvider(credentials1);
    const drive2 = new GoogleDriveProvider(credentials2);

    // Create storage pool (100GB)
    const pool = new StoragePool(1024 * 1024 * 1024 * 100);
    
    // Add providers (50GB each)
    pool.addProvider('drive1', drive1, 1024 * 1024 * 1024 * 50);
    pool.addProvider('drive2', drive2, 1024 * 1024 * 1024 * 50);

    // Create logical volume
    const volume = new LogicalVolume('my_volume', pool);

    // Upload a file
    const { fileId, providerId } = await volume.uploadFile(
        'local_file.txt',
        'documents/work/file.txt'
    );

    // Download a file
    await volume.downloadFile('documents/work/file.txt');

    // List files
    const files = await drive1.listFiles();
    console.log('Files:', files);
}

main().catch(console.error);