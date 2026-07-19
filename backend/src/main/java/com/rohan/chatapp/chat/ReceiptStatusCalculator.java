package com.rohan.chatapp.chat;

import java.util.List;

public final class ReceiptStatusCalculator {

    private ReceiptStatusCalculator() {
    }

    public static String aggregate(List<MessageStatus> recipientStatuses) {
        if (recipientStatuses.isEmpty()) {
            return "SENT";
        }
        boolean allRead = recipientStatuses.stream().allMatch(s -> s.getStatus() == DeliveryStatus.READ);
        if (allRead) {
            return "READ";
        }
        boolean allAtLeastDelivered = recipientStatuses.stream().noneMatch(s -> s.getStatus() == DeliveryStatus.SENT);
        if (allAtLeastDelivered) {
            return "DELIVERED";
        }
        return "SENT";
    }
}
