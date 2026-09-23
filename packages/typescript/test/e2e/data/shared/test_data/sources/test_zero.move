// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[allow(deprecated_usage)]
module test_data::test_zero;

use rtd::coin;
use rtd::url;

public struct TEST_ZERO has drop {}

fun init(witness: TEST_ZERO, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<TEST_ZERO>(
        witness,
        2,
        b"TEST",
        b"Test Coin",
        b"Test coin metadata",
        option::some(url::new_unsafe_from_bytes(b"http://rtd.io")),
        ctx,
    );

    transfer::public_share_object(metadata);
    transfer::public_share_object(treasury_cap)
}
