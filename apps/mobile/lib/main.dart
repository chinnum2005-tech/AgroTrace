import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/farm_register_screen.dart';
import 'screens/qr_scanner_screen.dart';
import 'services/auth_service.dart';

void main() {
  runApp(const AgriTraceApp());
}

class AgriTraceApp extends StatelessWidget {
  const AgriTraceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: MaterialApp(
        title: 'AgriTrace AI',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.green,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
        ),
        home: const LoginScreen(),
        routes: {
          '/home': (context) => const HomeScreen(),
          '/farm-register': (context) => const FarmRegisterScreen(),
          '/qr-scanner': (context) => const QRScannerScreen(),
        },
      ),
    );
  }
}
