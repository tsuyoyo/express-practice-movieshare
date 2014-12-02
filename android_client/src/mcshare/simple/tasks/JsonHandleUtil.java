/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.http.HttpEntity;

import android.util.Log;

public class JsonHandleUtil {

	public String getJSON(HttpEntity resEntitiy) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            resEntitiy.writeTo(outputStream);
            return outputStream.toString();
        } catch (IOException e) {
            Log.w("JsonHandleUtil", "Failed to get JSON : " + e.getMessage());
            return null;
        }
    }
	
}
