import 'package:flutter/material.dart';

class QRScannerScreen extends StatelessWidget {
  const QRScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Scanner placeholder
            Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.green, width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(
                    Icons.qr_code_scanner,
                    size: 150,
                    color: Colors.grey[400],
                  ),
                  Positioned(
                    bottom: 20,
                    child: Text(
                      'Align QR code within frame',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Instructions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: Text(
                'Scan the QR code on any AgriTrace product to verify its authenticity and view complete supply chain information.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            const SizedBox(height: 32),
            
            // Manual entry button
            OutlinedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Enter Product ID'),
                    content: TextField(
                      decoration: const InputDecoration(
                        hintText: 'AGRITRACE-...',
                        labelText: 'Product ID',
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Verifying product...')),
                          );
                        },
                        child: const Text('Verify'),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.keyboard),
              label: const Text('Enter Code Manually'),
            ),
          ],
        ),
      ),
    );
  }
}
