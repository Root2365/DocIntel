package com.docintel.backend.Service;

import java.util.UUID;

public final class VectorStoreDocumentId {

    private VectorStoreDocumentId() {
    }

    public static String fromChunkId(long chunkId) {
        return new UUID(0, chunkId).toString();
    }
}
