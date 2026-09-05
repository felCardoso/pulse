package com.echo.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Home-screen widget showing the next suggested workout and the current
 * streak. Content is written by HomeWidgetPlugin (called from the web app
 * whenever this data changes) into SharedPreferences, which this provider
 * reads back into the widget's RemoteViews. Tapping the widget opens the app.
 */
public class HomeWidgetProvider extends AppWidgetProvider {
    public static final String PREFS_NAME = "com.echo.app.HomeWidgetPrefs";
    public static final String KEY_WORKOUT = "workoutName";
    public static final String KEY_STREAK = "streak";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String workoutName = prefs.getString(KEY_WORKOUT, "Abrir o Echo");
        int streak = prefs.getInt(KEY_STREAK, 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_home);
        views.setTextViewText(R.id.widget_workout_name, workoutName);
        views.setTextViewText(R.id.widget_streak, streak > 0 ? ("🔥 " + streak) : "");

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, launchIntent, flags);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
