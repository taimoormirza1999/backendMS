const incrementFileView = async (fileId) => {
    const file = await storage.getFile(appwriteConfig.bucketId, fileId);
    const updatedFile = await storage.updateFile(appwriteConfig.bucketId, fileId, {
      viewCount: file.viewCount ? file.viewCount + 1 : 1,
    });
    return updatedFile;
  };