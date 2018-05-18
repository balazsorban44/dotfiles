# Visual Studio Code TensorFlow Snippets

This extension includes a set of useful code snippets for developing TensorFlow models in [Visual Studio Code](https://code.visualstudio.com/).

See [Getting started](#get-started) for a quick tutorial on how to use this extension.

![Generate a training framework](https://github.com/vahidk/tensorflow-snippets/raw/master/images/framework.gif)

## Features

The extension includes three sets of snippets.

The first are used to generate entire python files:
- `tf:trainer`: Generates an entire training framework based on learn API.
- `tf:cnn-classifier`: Generates a convolutional neural network classifier.
- `tf:mnist`: Generates data loader for mnist dataset.
- `tf:cifar10`: Generates data loader for CIFAR10 dataset.
- `tf:cifar100`: Generates data loader for CIFAR100 dataset.

The second set generate medium size snippets:
- `tf:resnet-block`: Generates a ResNet block.

The third set generate common TensorFlow operations:
- `tf:import`: Imports TensorFlow package.
- `tf:conv2d`: Defines a 2D convolution layer.
- `tf:transposed-conv2d`: Defines a transposed 2D convolution layer.
- `tf:separable-conv2d`: Defines a separable 2D convolution layer.
- `tf:dense`: Defines a dense (fully connected) layer.
- `tf:max-pool2d`: Defines a max pooling layer.
- `tf:dropout`: Defines a dropout layer.
- `tf:batch-norm`: Defines a batch normalization layer.
- `tf:cross-entropy`: Defines a softmax cross entropy loss.

## Installation
<a name="installation"></a>

Install Visual Studio Code from [here](https://code.visualstudio.com/).

Install this extension by selecting `Install Extension` in the command pallette (cmd-shift-p) and searching for "TensorFlow Snippets".

The generated code also relies on the following python dependencies:
```bash
pip install numpy
pip install tensorflow  # or tensorflow-gpu
pip install six
```

## Getting started
<a name="get-started"></a>

Make sure the [requirements](#installation) are installed.

Create a new directory for your project.
Create trainer.py, open the file and type: `tf:trainer` enter.
Create cnn.py, open the file and type: `tf:cnn-classifier` enter.
Create mnist.py, open the file and type: `tf:mnist` enter.

Edit trainer.py, and insert two lines at the top:
```python
import cnn
import mnist
```

In the MODELS dictionary, add a new element `"cnn": cnn`, also in the DATASETS dictionary add a new element `"mnist": mnist`. Now run the trainer:
```
python -m trainer --model=cnn --dataset=mnist
```

Open another terminal window in the same directory, and type:
```
tensorboard --logdir=output
```

Point your browser at http://localhost:6006.
