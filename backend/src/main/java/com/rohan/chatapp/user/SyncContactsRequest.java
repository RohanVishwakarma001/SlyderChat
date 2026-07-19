package com.rohan.chatapp.user;

import java.util.List;

public record SyncContactsRequest(List<String> phones) {
}
