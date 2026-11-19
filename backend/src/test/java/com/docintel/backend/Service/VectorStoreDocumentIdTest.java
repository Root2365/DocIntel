package com.docintel.backend.Service;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class VectorStoreDocumentIdTest {

    @Test
    void mapsChunkIdsToStableUniqueUuids() {
        String firstId = VectorStoreDocumentId.fromChunkId(7);

        assertEquals(UUID.fromString(firstId).toString(), firstId);
        assertEquals(firstId, VectorStoreDocumentId.fromChunkId(7));
        assertNotEquals(firstId, VectorStoreDocumentId.fromChunkId(8));
    }
}
